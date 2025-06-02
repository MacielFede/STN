// components/PolygonMap.tsx
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  useMapEvents,
  Popup,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L, { LatLng, type LeafletMouseEvent } from 'leaflet'
import { useState } from 'react'
import { getStops } from '@/services/busStops'
import type { BusStopFeature } from '@/models/geoserver'
//import { FaTrash } from 'react-icons/fa'

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const highlightIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // ícono especial
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -35],
})

function ClickHandler({ onClick }: { onClick: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onClick(e.latlng)
    },
  })
  return null
}

export default function PolygonMap() {
  const [polygonPoints, setPolygonPoints] = useState<LatLng[]>([])
  const [foundStops, setFoundStops] = useState<BusStopFeature[]>([])

  const handleMapClick = (latlng: LatLng) => {
    setPolygonPoints((prev) => [...prev, latlng])
  }

  const handleClear = () => {
    setPolygonPoints([])
    setFoundStops([])
  }

  const handleSearch = async () => {
    if (polygonPoints.length < 3) return

    const wktPolygon = `POLYGON((
      ${polygonPoints.map((p) => `${p.lng} ${p.lat}`).join(', ')},
      ${polygonPoints[0].lng} ${polygonPoints[0].lat}
    ))`

    const cqlFilter = `INTERSECTS(geom, ${wktPolygon})`
    const stops = await getStops(cqlFilter)
    setFoundStops(stops)
  }

  return (
    <div className="h-screen w-full flex">
      <div className="w-3/4 relative">
        <MapContainer center={[-34.9, -56.164]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <ClickHandler onClick={handleMapClick} />

          {polygonPoints.length >= 3 && (
            <Polygon
              positions={polygonPoints.map((p) => [p.lat, p.lng])}
              pathOptions={{ color: 'green', fillOpacity: 0.3 }}
            />
          )}

          {foundStops.map((stop) => (
            <Marker
              key={stop.id}
              position={[stop.geometry.coordinates[1], stop.geometry.coordinates[0]]}
              icon={highlightIcon}
            >
              <Popup>
                <strong>{stop.properties.name}</strong><br />
                {stop.properties.description || 'Sin descripción'}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="absolute top-4 left-4 space-x-2 z-[1000]">
          <button
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            onClick={handleSearch}
          >
            Buscar paradas
          </button>
          <button
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            onClick={handleClear}
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="w-1/4 bg-gray-100 overflow-auto p-4">
        <h2 className="text-xl font-bold mb-2">Paradas encontradas</h2>
        {foundStops.length === 0 ? (
          <p className="text-gray-600">No hay paradas en el área.</p>
        ) : (
          <ul className="space-y-2">
            {foundStops.map((stop) => (
              <li key={stop.id} className="bg-white p-2 rounded shadow">
                <strong>{stop.properties.name}</strong>
                <p className="text-sm text-gray-700">
                  {stop.properties.description || 'Sin descripción'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
