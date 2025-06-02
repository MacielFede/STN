import { useEffect, useState } from 'react'
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Polygon,
  GeoJSON,
  Marker,
} from 'react-leaflet'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'leaflet/dist/leaflet.css'
import '@/styles/Map.css'
import L from 'leaflet'
//import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Drawer, DrawerHeader, DrawerItems } from 'flowbite-react'
import PolygonDrawHandler from '@/components/atoms/PolygonDrawHandler'

import { api } from '@/api/config'

function EndUserMap() {
  const [position, setPosition] = useState<[number, number]>([-34.9011, -56.1645])
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [intersectingLines, setIntersectingLines] = useState<any[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setPosition([latitude, longitude])
      },
      (err) => {
        console.error('Error obteniendo ubicación:', err)
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

  async function searchLines() {
    if (polygonPoints.length < 3) {
      toast.warn('El polígono debe tener al menos 3 puntos.', {
        theme: 'colored',
      })
      return
    }

    try {
      const response = await api.post('lines/intersecting', {
        polygon: polygonPoints,
      })
      setIntersectingLines(response.data)
      setDrawerOpen(true)
    } catch (error) {
      console.error(error)
      toast.error('Error al buscar líneas.', { theme: 'colored' })
    }
  }

  return (
    <div className="relative h-screen">
      <MapContainer
        preferCanvas
        center={position}
        zoom={13}
        className="leaflet-container h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
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

        {polygonPoints.length > 2 && <Polygon positions={polygonPoints} color="blue" />} 

        {polygonPoints.map((point, idx) => (
          <Marker
            key={idx}
            position={point}
            icon={L.divIcon({ className: 'custom-marker', html: `<div class='w-2 h-2 rounded-full bg-blue-600'></div>` })}
            eventHandlers={{
              click: () => {
                setPolygonPoints((prev) => {
                  const newPoints = [...prev]
                  newPoints.splice(idx, 1)
                  return newPoints
                })
              },
            }}
          />
        ))}

        {intersectingLines.map((line, idx) => (
          <GeoJSON key={idx} data={line.geometry} style={{ color: 'green' }} />
        ))}

        <PolygonDrawHandler isDrawing={isDrawing} setPolygonPoints={setPolygonPoints} />
      </MapContainer>

      <div className="absolute top-4 left-4 z-[1000] space-y-2">
        <button
          onClick={() => {
            setIsDrawing(!isDrawing)
            setPolygonPoints([])
            setIntersectingLines([])
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow"
        >
          {isDrawing ? 'Cancelar dibujo' : 'Dibujar polígono'}
        </button>

        {polygonPoints.length >= 3 && (
          <button
            onClick={searchLines}
            className="bg-green-600 text-white px-4 py-2 rounded-xl shadow"
          >
            Buscar líneas
          </button>
        )}
      </div>

      <Drawer open={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        position="bottom"
        className="z-3000 bg-gray-200 max-h-50"
        backdrop={false}>
        <DrawerItems>
          <DrawerHeader>Líneas encontradas
          </DrawerHeader>
          <ul className="px-4 pb-4">
            {intersectingLines.map((line, idx) => (
              <li key={idx} className="border-b py-2">
                <span className="font-semibold">Línea {line.number}</span>: {line.companyName}
              </li>
            ))}
            {intersectingLines.length === 0 && (
              <p className="text-gray-500">No se encontraron líneas.</p>
            )}
          </ul>
        </DrawerItems>
      </Drawer>
    </div>
  )
}

export default EndUserMap
