import { ControlButtons } from '../ui/button'

interface PolygonDrawerControlProps {
  isDrawing: boolean
  polygonPoints: [number, number][]
  onToggleDrawing: () => void
  onSearch: () => void
}

export function PolygonDrawerControl({
  isDrawing,
  polygonPoints,
  onToggleDrawing,
  onSearch,
}: PolygonDrawerControlProps) {
  return (
    <ControlButtons
      isDrawing={isDrawing}
      polygonPoints={polygonPoints}
      onToggleDrawing={onToggleDrawing}
      onSearch={onSearch}
    />
  )
}
