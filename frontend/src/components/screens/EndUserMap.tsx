import { useCallback, useEffect, useState } from 'react'
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
import L, { LatLng } from 'leaflet'
import PolygonDrawHandler from '@/components/atoms/PolygonDrawHandler'
import { ControlButtons } from '../ui/button'
import { useUserLocation } from '@/hooks/useUserLocation'
import { geoApi } from '@/api/config'
import CommandPallete from '../atoms/CommandPallete'
import { LineDrawer } from '../atoms/LineDrawer'
import BusStops from '../molecules/BusStops'
import type { BusStopFeature } from '@/models/geoserver'

const geoJsonStyle = {
  color: 'green',
  weight: 3,
  opacity: 0.8,
}


type Line = {
  id: string
  number: string
  companyName: string
  geometry: GeoJSON.GeoJsonObject
}

function latLngsToWktPolygon(points: [number, number][]): string {
  const coords = points.map(([lat, lng]) => `${lng} ${lat}`).join(', ')
  const [firstLat, firstLng] = points[0]
  return `POLYGON((${coords}, ${firstLng} ${firstLat}))`
}

function parseLines(features: any[]): Line[] {
  return features
    .map((f) => {
      const id = String(f.id ?? f.properties?.id)
      const geometry = f.geometry
      if (!id || !geometry) return null

      return {
        id,
        geometry,
        number: f.properties?.number ?? '(sin número)',
        companyName: f.properties?.companyName ?? '(sin empresa)',
      }
    })
    .filter((line): line is Line => line !== null)
}

async function fetchLinesFromGeoServer(polygonPoints: [number, number][]) {
  const wktPolygon = latLngsToWktPolygon(polygonPoints)

  try {
    const response = await geoApi.get('', {
      params: {
        typeName: 'myworkspace:ft_bus_line',
        CQL_FILTER: `INTERSECTS(geometry, ${wktPolygon})`,
      },
    })
    return response.data.features || []
  } catch (error) {
    console.error('Error al consultar líneas en GeoServer:', error)
    toast.error('Error al obtener líneas desde GeoServer')
    return []
  }
}

function EndUserMap() {
  const position = useUserLocation()
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [intersectingLines, setIntersectingLines] = useState<Line[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeStop, setActiveStop] = useState<BusStopFeature | null>(null)
  const [selectedLineIds, setSelectedLineIds] = useState<string[]>([])

  const handleCloseDrawer = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    if (activeStop) setIsOpen(true)
  }, [activeStop])

  async function searchLines() {
    if (polygonPoints.length < 3) {
      toast.warn('El polígono debe tener al menos 3 puntos.', {
        theme: 'colored',
      })
      return
    }

    const lines = await fetchLinesFromGeoServer(polygonPoints)
    const parsedLines = parseLines(lines)
    setIntersectingLines(parsedLines)
    setDrawerOpen(true)

    console.log('GeoServer response:', lines)
    console.log('Parsed lines:', parsedLines)
    console.log('IDs:', parsedLines.map((l) => l.id))
  }

  const toggleLineVisibility = (lineId: string) => {
    setSelectedLineIds((prev) =>
      prev.includes(lineId)
        ? prev.filter((id) => id !== lineId)
        : [...prev, lineId]
    )
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

        <BusStops setActiveStop={setActiveStop} />

        {polygonPoints.length > 2 && (
          <Polygon positions={polygonPoints} color="yellow" />
        )}

        {polygonPoints.map((point, idx) => (
          <Marker
            key={idx}
            position={point}
            icon={L.divIcon({
              className: 'custom-marker',
              html: `<div class='w-2 h-2 rounded-full bg-pink-600'></div>`,
            })}
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

        {intersectingLines
          .filter((line) => selectedLineIds.includes(line.id))
          .map((line) => (
            <GeoJSON key={line.id} data={line.geometry} style={geoJsonStyle} />
          ))}

        <PolygonDrawHandler
          isDrawing={isDrawing}
          setPolygonPoints={setPolygonPoints}
        />
      </MapContainer>

      <CommandPallete yPosition="top" xPosition="right">
        <ControlButtons
          isDrawing={isDrawing}
          polygonPoints={polygonPoints}
          onToggleDrawing={() => {
            setIsDrawing(!isDrawing)
            setPolygonPoints([])
            setIntersectingLines([])
            setSelectedLineIds([])
          }}
          onSearch={searchLines}
        />
      </CommandPallete>

      <LineDrawer
        lines={intersectingLines}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedLineIds={selectedLineIds}
        onToggleLine={toggleLineVisibility}
      />
    </div>
  )
}

export default EndUserMap
