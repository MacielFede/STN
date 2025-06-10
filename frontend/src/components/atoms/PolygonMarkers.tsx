import { Marker, Polygon, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

interface PolygonMarkersProps {
  isDrawing: boolean
  polygonPoints: [number, number][]
  setPolygonPoints: React.Dispatch<React.SetStateAction<[number, number][]>>
}

export function PolygonMarkers({ isDrawing, polygonPoints, setPolygonPoints }: PolygonMarkersProps) {
    useMapEvents({
        click(e) {
          if (!isDrawing) return
          const { lat, lng } = e.latlng
          setPolygonPoints((prev) => {
            const index = prev.findIndex(
              ([pLat, pLng]) => Math.abs(pLat - lat) < 0.0001 && Math.abs(pLng - lng) < 0.0001
            )
            if (index !== -1) {
              const newPoints = [...prev]
              newPoints.splice(index, 1)
              return newPoints
            }
            return [...prev, [lat, lng]]
          })
        },
      })
  
  return (
    <>
      {polygonPoints.length > 2 && <Polygon positions={polygonPoints} color="yellow" />}
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
