import { useCallback, useEffect, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'leaflet/dist/leaflet.css'
import '@/styles/Map.css'
import BusStops  from '../molecules/BusStops'
import OriginDestinationSelector  from '../organisms/OriginDestinationSelector'
import { Button } from '../ui/button'
import Modal from '../atoms/Modal'
import CommandPallete from '../atoms/CommandPallete'
import type { BusLineFeature, BusStopFeature } from '@/models/geoserver'
import { Drawer, DrawerHeader, DrawerItems } from 'flowbite-react'
import BusStopInfo from '../atoms/BusStopInfo'
import BusStopLines from '../atoms/BusStopLines'
import { GeoJSON } from 'react-leaflet'
import { Separator } from '../ui/separator'


function EndUserMap() {




// Para mostrar recorridos, se llama desde BusStopLines
const [selectedRoutes, setSelectedRoutes] = useState<BusLineFeature[]>([])

function handleSelectRoute(route: BusLineFeature) {
  setSelectedRoutes((prev) => {
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




const [isOpen, setIsOpen] = useState(false)


const [activeStop, setActiveStop] = useState<BusStopFeature | null>(null)

  


  const handleCloseDrawer = useCallback(() => {
    setIsOpen(false)
    setActiveStop(null)
    setSelectedRoutes([]) 
  }, [])



useEffect(() => {
  if (activeStop) {
    setIsOpen(true)
  }
}, [activeStop])
  const [position, setPosition] = useState<[number, number]>([
    -34.9011, -56.1645,
  ])
  
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
          position: 'top-right',
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


<CommandPallete yPosition="top" xPosition="right">
  <OriginDestinationSelector />
  <BusStops setActiveStop={setActiveStop} />
</CommandPallete>

      {
        <CircleMarker
          center={position}
          radius={80} // en píxeles
          pathOptions={{
            color: 'skyblue',
            fillColor: 'skyblue',
            fillOpacity: 0.2,
          }}
        >
          <Popup>Estás aquí</Popup>
        </CircleMarker>
      }
       
       {selectedRoutes.map((route) => (
  <GeoJSON key={route.id} data={route} />
))}


       
    </MapContainer>
    
<Drawer
        open={isOpen}
        onClose={handleCloseDrawer}
        position="bottom"
        className="z-3000 bg-gray-200 space-y-2 max-h-[300px] overflow-y-auto"
        backdrop={false}
      >
        <DrawerHeader>STN</DrawerHeader>
        <DrawerItems>
          {activeStop && <BusStopInfo stop={activeStop} />}
          <Separator className="my-4 bg-black" decorative />
          
          {activeStop?.geometry.coordinates && (
          <BusStopLines
          point={[
            activeStop.geometry.coordinates[0],
            activeStop.geometry.coordinates[1],
          ]}
          onSelectRoute={handleSelectRoute}
          selectedRoutes={selectedRoutes}
        />

)}

        </DrawerItems>
      </Drawer>
    </>


  )
}

export default EndUserMap
