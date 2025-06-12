import { useCallback, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Drawer, DrawerHeader, DrawerItems } from 'flowbite-react'
import { Button } from '../ui/button'
import Modal from '../atoms/Modal'
import BusStops from '../molecules/BusStops'
import NewBusStopComponent from '../molecules/admin/NewBusStop'
import { Separator } from '../ui/separator'
import BusLineForm from '../molecules/admin/BusLineForm'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import type { BusLineFeature, BusStopFeature } from '@/models/geoserver'
import BusLineCreator from '@/components/molecules/admin/BusLineCreator'
import CommandPallete from '@/components/atoms/CommandPallete'
import BusStopForm from '@/components/molecules/admin/BusStopForm'
import CompanyCRUD from '@/components/molecules/admin/CompanyCRUD'
import { BASIC_LINE_FEATURE, BASIC_STOP_FEATURE } from '@/utils/constants'
import useLines from '@/hooks/useLines'
import { useBusLineContext } from '@/contexts/BusLineContext'
import StopAssignmentDrawer from '../molecules/admin/StopAssignmentDrawer'

const AdminMap = () => {
  const [, , removeCookie] = useCookies(['admin-jwt'])
  const [isOpen, setIsOpen] = useState(false)
  const [activeStop, setActiveStop] = useState<BusStopFeature | null>(null)
  const { newBusLine, setNewBusLine, cleanUpBusLineStates, busLineStep, setBusLineStep, switchMode } = useBusLineContext();
  const { lines } = useLines(activeStop?.properties.id)

  const handleCloseDrawer = useCallback(() => {
    setIsOpen(false)
    setActiveStop(null)
    cleanUpBusLineStates();
  }, [])

  useEffect(() => {
    console.log('lines updated:', lines)
  }, [lines])

  useEffect(() => {
    if (activeStop || newBusLine) setIsOpen(true)
    else setIsOpen(false)
  }, [activeStop, newBusLine])

  return (
    <>
      <CommandPallete yPosition="top" xPosition="right">
        <Modal
          type="Companies"
          trigger={<Button>Administrar empresas</Button>}
          body={<CompanyCRUD />}
        />
        <Button
          disabled={!!newBusLine || !!activeStop}
          onClick={() => setActiveStop(BASIC_STOP_FEATURE)}
        >
          Crear parada de omnibus
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setNewBusLine(BASIC_LINE_FEATURE)}
              disabled={!!newBusLine || !!activeStop}
            >
              Crear linea de omnibus
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
        center={[-32.5, -56.164]}
        zoom={8}
        scrollWheelZoom
        zoomControl={false}
      >
        <StopAssignmentDrawer
          open={busLineStep !== null}
          onClose={() => {
            setBusLineStep(null);
            switchMode('edition');
          }}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BusStops setActiveStop={setActiveStop} />
        {activeStop && !activeStop.id && (
          <NewBusStopComponent
            setNewStop={setActiveStop}
            newStopGeom={activeStop.geometry}
          />
        )}
        {newBusLine && (
          <BusLineCreator />
        )}
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
          {activeStop && (
            <>
              <BusStopForm
                stop={activeStop}
                setStop={setActiveStop}
                resetActiveStop={() => setActiveStop(null)}
              />
              <Separator className="my-4 bg-black" decorative />
              {lines?.map((line) => <BusLineForm line={line} />)}
            </>
          )}
          {newBusLine && busLineStep === null && <BusLineForm line={newBusLine} />}
        </DrawerItems>
      </Drawer>

    </>
  )
}

export default AdminMap
