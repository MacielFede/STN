import { GeoJSON } from 'react-leaflet'
import type { GeoJsonObject } from 'geojson'
import type { BusLineProperties } from '@/models/database'
interface BusLineWithGeometry extends BusLineProperties {
  geometry: GeoJsonObject
}
const geoJsonStyle = {
  color: 'green',
  weight: 3,
  opacity: 0.8,
}

interface IntersectingLinesLayerProps {
  lines: BusLineWithGeometry[]
  selectedLineIds: number[]
}

export function IntersectingLinesLayer({
  lines,
  selectedLineIds,
}: IntersectingLinesLayerProps) {
  return (
    <>
      {lines
        .filter((line) => selectedLineIds.includes(line.id))
        .map((line) => (
          <GeoJSON key={line.id} data={line.geometry as GeoJsonObject} style={geoJsonStyle} />
        ))}
    </>
  )
}