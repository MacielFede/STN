import { GeoJSON } from 'react-leaflet'

const geoJsonStyle = {
  color: 'green',
  weight: 3,
  opacity: 0.8,
}

interface Line {
  id: string
  geometry: GeoJSON.GeoJsonObject
}

interface IntersectingLinesLayerProps {
  lines: Line[]
  selectedLineIds: string[]
}

export function IntersectingLinesLayer({ lines, selectedLineIds }: IntersectingLinesLayerProps) {
  return (
    <>
      {lines
        .filter((line) => selectedLineIds.includes(line.id))
        .map((line) => (
          <GeoJSON key={line.id} data={line.geometry} style={geoJsonStyle} />
        ))}
    </>
  )
}
