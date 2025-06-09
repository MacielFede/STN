import { MapContainer, TileLayer, Polygon } from 'react-leaflet'
import { useState, useCallback, useEffect } from 'react'
import PolygonDrawHandler from '@/components/atoms/PolygonDrawHandler'
import CommandPallete from '../atoms/CommandPallete'
import BusStops from '../molecules/BusStops'
import { LineDrawer } from '../atoms/LineDrawer'
import { useUserLocation } from '@/hooks/useUserLocation'
import { UserPositionMarker } from '../atoms/UserPositionMarker'
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
    await searchLines(polygonPoints)
    setDrawerOpen(true)
  }

  const onToggleDrawing = () => {
    setIsDrawing(!isDrawing)
    setPolygonPoints([])
    setIntersectingLines([])
    setSelectedLineIds([])
  }

  return (
    <div className="relative h-screen">
      <MapContainer preferCanvas center={position} zoom={13} className="leaflet-container h-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <UserPositionMarker position={position} />
        <BusStops setActiveStop={setActiveStop} />
        {polygonPoints.length > 2 && <Polygon positions={polygonPoints} color="yellow" />}
        <PolygonMarkers polygonPoints={polygonPoints} setPolygonPoints={setPolygonPoints} />
        <IntersectingLinesLayer lines={intersectingLines} selectedLineIds={selectedLineIds} />
        <PolygonDrawHandler isDrawing={isDrawing} setPolygonPoints={setPolygonPoints} />
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
