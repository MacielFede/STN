import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { useState, useCallback, useEffect } from 'react'
import CommandPallete from '../atoms/CommandPallete'
import BusStops from '../molecules/BusStops'
import { LineDrawer } from '../atoms/LineDrawer'
import { useUserLocation } from '@/hooks/useUserLocation'
import { PolygonMarkers } from '../atoms/PolygonMarkers'
import { IntersectingLinesLayer } from '../atoms/IntersectingLinesLayer'
import { PolygonDrawerControl } from '../atoms/PolygonDrawerControl'
import { useLinesSearch } from '../../hooks/useLinesSearch'
import type { BusStopFeature } from '@/models/geoserver'

function EndUserMap() {
  const position = useUserLocation()
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const { intersectingLines, searchLines, setIntersectingLines } = useLinesSearch()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedLineIds, setSelectedLineIds] = useState<number[]>([])
  const [activeStop, setActiveStop] = useState<BusStopFeature | null>(null)

  const toggleLineVisibility = (lineId: number) => {
    setSelectedLineIds((prev) =>
      prev.includes(lineId)
        ? prev.filter((id) => id !== lineId)
        : [...prev, lineId]
    )
  }

  const onSearch = async () => {
    if (polygonPoints.length < 3) return
    await searchLines(polygonPoints)
    setDrawerOpen(true)
  }

  const onToggleDrawing = () => {
    setIsDrawing(!isDrawing)
    setPolygonPoints([])
    setIntersectingLines([])
    setSelectedLineIds([])
    setDrawerOpen(false)
  }
  return (
    <div className="relative h-screen">
      <MapContainer preferCanvas center={position} zoom={13} className="leaflet-container h-full">
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
        
        <PolygonMarkers isDrawing={isDrawing} polygonPoints={polygonPoints} setPolygonPoints={setPolygonPoints} />
        <IntersectingLinesLayer lines={intersectingLines} selectedLineIds={selectedLineIds} />
      </MapContainer>

      <CommandPallete yPosition="top" xPosition="right">
        <PolygonDrawerControl
          isDrawing={isDrawing}
          polygonPoints={polygonPoints}
          onToggleDrawing={onToggleDrawing}
          onSearch={onSearch}
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
