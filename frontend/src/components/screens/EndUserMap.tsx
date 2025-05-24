import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'leaflet/dist/leaflet.css'
import '@/styles/Map.css'
import { CircleMarker } from 'react-leaflet'

function EndUserMap  ()  {
  const [position, setPosition] = useState<[number, number]>([-34.9011, -56.1645])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setPosition([latitude, longitude])
      },
      (err) => {
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
          toastId: 'Location-error'
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [])

  return (
    
      <MapContainer preferCanvas center={position} zoom={13} className="leaflet-container">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {<CircleMarker
  center={position}
  radius={80} // en píxeles
  pathOptions={{ color: 'skyblue', fillColor: 'skyblue', fillOpacity: 0.2 }}
>
  <Popup>Estás aquí</Popup>
</CircleMarker>}
      </MapContainer>

     

  
  )
}

export default EndUserMap
