import { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'leaflet/dist/leaflet.css'
import '@/styles/Map.css'
import { Drawer, DrawerHeader, DrawerItems } from 'flowbite-react'
import BusStops from '../molecules/BusStops'
import CommandPallete from '../atoms/CommandPallete'
import CompanySelector from '../molecules/end-user/CompanySelector'
import BusStopInfo from '../molecules/end-user/BusStopInfo'
import type { BusStopFeature } from '@/models/geoserver'
import useLines from '@/hooks/useLines'

function EndUserMap() {
  const [position, setPosition] = useState<[number, number]>([
    -34.9011, -56.1645,
  ])
  const [isOpen, setIsOpen] = useState(false)
  const [activeStop, setActiveStop] = useState<BusStopFeature | null>(null)
  const { lines } = useLines()
  const handleCloseDrawer = () => {
    setIsOpen(false)
    setActiveStop(null)
  }

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

  useEffect(() => {
    if (activeStop || lines) setIsOpen(true)
    else setIsOpen(false)
  }, [activeStop, lines])

  return (
    <>
      <CommandPallete yPosition="top" xPosition="right">
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
      <Drawer
        open={isOpen}
        onClose={handleCloseDrawer}
        position="bottom"
        className="z-3000 bg-gray-200 max-h-50"
      >
        <DrawerHeader>STN</DrawerHeader>
        <DrawerItems>
          {activeStop && <BusStopInfo stop={activeStop} />}
          {lines?.map((busLine) => <div>{busLine.id}</div>)}
        </DrawerItems>
      </Drawer>
    </>
  )
}

export default EndUserMap
