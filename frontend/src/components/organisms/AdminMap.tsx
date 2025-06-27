import { useCallback, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet'
import { Drawer, DrawerHeader, DrawerItems } from 'flowbite-react'
import { Button } from '../ui/button'
import Modal from '../atoms/Modal'
import BusStops from '../molecules/BusStops'
import NewBusStopComponent from '../molecules/admin/NewBusStop'
import { Separator } from '../ui/separator'
import BusLineForm from '../molecules/admin/BusLineForm'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import BusLinetable from '../molecules/end-user/BusLineTable'
import StopAssignmentDrawer from '../molecules/admin/StopAssignmentDrawer'
import BusLinesCrud from '../molecules/admin/BusLinesCrud'
import Loader from '../../../public/loader.gif'
import type { BusLineFeature } from '@/models/geoserver'
import BusLineCreator from '@/components/molecules/admin/BusLineCreator'
import CommandPallete from '@/components/atoms/CommandPallete'
import BusStopForm from '@/components/molecules/admin/BusStopForm'
import CompanyCRUD from '@/components/molecules/admin/CompanyCRUD'
import { BASIC_STOP_FEATURE, DEFAULT_MAP_LOCATION } from '@/utils/constants'
import useLines from '@/hooks/useLines'
import { useBusLineContext } from '@/contexts/BusLineContext'
import { useBusStopContext } from '@/contexts/BusStopContext'

const geoJsonStyle = {
  color: 'blue',
  weight: 3,
  opacity: 0.8,
}

const AdminMap = () => {
  const [, , removeCookie] = useCookies(['admin-jwt'])
  const [isOpen, setIsOpen] = useState(false)
  const {
    newBusLine,
    cleanUpBusLineStates,
    busLineStep,
    setBusLineStep,
    isLoaderActive,
  } = useBusLineContext()
  const {
    stop: activeStop,
    setStop: setActiveStop,
    cleanUpStopState,
  } = useBusStopContext()
  const { lines } = useLines()
  const [displayedRoutes, setDisplayedRoutes] = useState<Array<BusLineFeature>>(
    [],
  )

  function handleDisplayRoute(route: BusLineFeature) {
    setDisplayedRoutes((prev) => {
      const exists = prev.some((r) => r.id === route.id)
      if (exists) {
        return prev.filter((r) => r.id !== route.id)
      } else {
        return [...prev, route]
      }
    })
  }

  const handleCloseDrawer = useCallback(() => {
    setIsOpen(false)
    setActiveStop(null)
    cleanUpBusLineStates()
    cleanUpStopState()
  }, [setActiveStop, setIsOpen, cleanUpBusLineStates, cleanUpStopState])

  useEffect(() => {
    if (activeStop || newBusLine) setIsOpen(true)
    else setIsOpen(false)
  }, [activeStop, newBusLine])

  return (
    <>
      <CommandPallete yPosition="top" xPosition="right" displayToogle={false}>
        <Modal
          type="Companies"
          trigger={<Button>Administrar empresas</Button>}
          body={<CompanyCRUD />}
        />
        <Button
          disabled={!!newBusLine || !!activeStop || busLineStep === 'show-crud'}
          onClick={() => setActiveStop(BASIC_STOP_FEATURE)}
        >
          Crear parada de omnibus
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                if (busLineStep === 'show-crud') {
                  handleCloseDrawer()
                  return
                }
                setBusLineStep('show-crud')
              }}
              disabled={!!newBusLine || !!activeStop}
            >
              Lineas
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>
              Clickea en cualquier parte del mapa para formar el recorrido de la
              linea
            </p>
            <hr />
            <p>Arrastra para mover el mapa</p>
          </TooltipContent>
        </Tooltip>
        <Button
          className="bg-red-800"
          onClick={() => removeCookie('admin-jwt')}
        >
          Sign out
        </Button>
      </CommandPallete>

      <MapContainer
        preferCanvas={false}
        center={DEFAULT_MAP_LOCATION}
        zoom={8}
        scrollWheelZoom
        zoomControl={false}
      >
        {isLoaderActive && (
          <div
            className="flex justify-center flex-col items-center"
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              zIndex: 9999,
              background: 'black',
              opacity: 0.8,
            }}
          >
            <img src={Loader} alt="Loading..." style={{ scale: '.7' }} />
            <h1 className="text-white font-semibold text-lg">
              Calculando ruta..., por favor espera
            </h1>
          </div>
        )}
        <BusLinesCrud onClose={handleCloseDrawer} />
        <StopAssignmentDrawer
          open={
            busLineStep === 'show-selection-popup' ||
            busLineStep === 'select-origin' ||
            busLineStep === 'select-destination'
          }
          onClose={() => {
            handleCloseDrawer()
          }}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {displayedRoutes.map((line) => (
          <GeoJSON key={line.id} data={line} style={geoJsonStyle} />
        ))}
        <BusStops setActiveStop={setActiveStop} activeStop={activeStop} />
        {activeStop && !activeStop.id && (
          <NewBusStopComponent
            setNewStop={setActiveStop}
            newStopGeom={activeStop.geometry}
          />
        )}
        {newBusLine && <BusLineCreator />}
      </MapContainer>

      <Drawer
        open={isOpen}
        onClose={handleCloseDrawer}
        position="bottom"
        className="z-3000 bg-gray-200 max-h-50"
        backdrop={false}
      >
        <DrawerHeader title="STN | Ver información de paradas y recorridos seleccionados" />
        <DrawerItems>
          {activeStop && busLineStep !== 'show-selection-popup' && (
            <>
              <BusStopForm />
              <Separator className="my-4 bg-black" decorative />
              {lines.map((line) => (
                <BusLineForm line={line} />
              ))}
            </>
          )}
          {newBusLine && busLineStep === 'creation' ? (
            <BusLineForm line={newBusLine} />
          ) : (
            <BusLinetable
              onDisplayRoute={handleDisplayRoute}
              displayedRoutes={displayedRoutes}
              activeStopId={activeStop?.properties.id}
              selectedRouteId=""
            />
          )}
        </DrawerItems>
      </Drawer>
    </>
  )
}

export default AdminMap
