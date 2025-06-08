import { Marker } from 'react-leaflet'
import L from 'leaflet'

interface PolygonMarkersProps {
  polygonPoints: [number, number][]
  setPolygonPoints: React.Dispatch<React.SetStateAction<[number, number][]>>
}

export function PolygonMarkers({ polygonPoints, setPolygonPoints }: PolygonMarkersProps) {
  return (
    <>
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
    </>
  )
}
