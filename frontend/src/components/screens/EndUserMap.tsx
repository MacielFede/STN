import { useEffect, useState } from 'react'
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Popup,
  TileLayer,
} from 'react-leaflet'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'leaflet/dist/leaflet.css'
import '@/styles/Map.css'
import { Drawer, DrawerHeader, DrawerItems } from 'flowbite-react'
import { Separator } from '../ui/separator'
import BusStops from '../molecules/BusStops'
import CommandPallete from '../atoms/CommandPallete'
import CompanySelector from '../molecules/end-user/CompanySelector'
import BusStopTable from '../molecules/end-user/BusStopTable'
import BusLinetable from '../molecules/end-user/BusLineTable'
import ArrowTop from '../../../public/arrow_top.svg?react'
import ArrowDown from '../../../public/arrow_down.svg?react'
import ScheduleSelector from '../molecules/end-user/ScheduleSelector'
import type { BusLineFeature, BusStopFeature } from '@/models/geoserver'
import useLines from '@/hooks/useLines'

function EndUserMap() {
  const [position, setPosition] = useState<[number, number]>([
    -34.9011, -56.1645,
  ])
  const [isOpen, setIsOpen] = useState(false)
  const [activeStop, setActiveStop] = useState<BusStopFeature | null>(null)
  const [displayedRoutes, setDisplayedRoutes] = useState<Array<BusLineFeature>>(
    [],
  )
  const { lines } = useLines()

  function handleDisplayRoute(route: BusLineFeature) {
    setDisplayedRoutes((prev) => {
      const exists = prev.some((r) => r.id === route.id)
      if (exists) {
        // Quitarla
        return prev.filter((r) => r.id !== route.id)
      } else {
        // Agregarla
        return [...prev, route]
      }
    })
  }
  const handleCloseDrawer = () => {
    setIsOpen(false)
    setActiveStop(null)
  }

  useEffect(() => {
    setDisplayedRoutes([])
  }, [lines])

  useEffect(() => {
    if (activeStop || lines?.length) setIsOpen(true)
    else setIsOpen(false)
  }, [activeStop, lines])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setPosition([latitude, longitude])
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error('Error obteniendo ubicación:', err)

        // Mostrar toast de error
        toast.error('No se pudo determinar su ubicación', {
          position: 'top-left',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
          toastId: 'Location-error',
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }, [])

  return (
    <>
      <CommandPallete yPosition="top" xPosition="right">
        <ScheduleSelector />
        <CompanySelector />
      </CommandPallete>
      <MapContainer
        preferCanvas
        center={position}
        zoom={13}
        className="leaflet-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <BusStops setActiveStop={setActiveStop} />
        {displayedRoutes.map((line) => (
          <GeoJSON key={line.id} data={line} style={{ color: 'red' }} />
        ))}
        <CircleMarker
          center={position}
          radius={80}
          pathOptions={{
            color: 'skyblue',
            fillColor: 'skyblue',
            fillOpacity: 0.2,
          }}
        >
          <Popup>Estás aquí</Popup>
        </CircleMarker>
      </MapContainer>
      {((lines && lines.length > 0) || activeStop) && (
        <Drawer
          open={isOpen}
          onClose={handleCloseDrawer}
          position="bottom"
          className="z-3000 bg-gray-200 max-h-50 p-0"
          edge
        >
          <DrawerHeader
            title="STN | Ver información de paradas y recorridos seleccionados"
            titleIcon={isOpen ? ArrowDown : ArrowTop}
            onClick={() => setIsOpen(!isOpen)}
            className="cursor-pointer px-4 pt-4 mb-1 hover:bg-gray-50 dark:hover:bg-gray-700"
          />
          <DrawerItems>
            {activeStop && (
              <>
                <BusStopTable stop={activeStop} />
                <Separator className="my-4 bg-black" decorative />
              </>
            )}
            <BusLinetable
              onDisplayRoute={handleDisplayRoute}
              displayedRoutes={displayedRoutes}
              activeStopId={activeStop?.properties.id}
            />
          </DrawerItems>
        </Drawer>
      )}
    </>
  )
}

export default EndUserMap
