import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'leaflet/dist/leaflet.css'
<<<<<<< HEAD:frontend/src/screens/EndUserMap.tsx
import '../styles/Map.css'
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
        })
      },
      {
        //enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [])
=======
import '../../styles/Map.css'
>>>>>>> origin/develop:frontend/src/components/screens/EndUserMap.tsx

  return (
<<<<<<< HEAD:frontend/src/screens/EndUserMap.tsx
    <>
      <MapContainer center={position} zoom={13} className="leaflet-container">
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

     

    </>
=======
    <MapContainer
      preferCanvas={true}
      center={[-32.5, -56.164]}
      zoom={8}
      scrollWheelZoom
    >
      <TileLayer
        url="https://geoweb.montevideo.gub.uy/geonetwork/srv/spa/catalog.search#/metadata/c6ea0476-9804-424a-9fae-2ac8ce2eee31"
        crossOrigin
      />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
>>>>>>> origin/develop:frontend/src/components/screens/EndUserMap.tsx
  )
}

export default EndUserMap
