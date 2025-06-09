import { useMapEvents } from 'react-leaflet'

interface PolygonDrawHandlerProps {
  isDrawing: boolean
  setPolygonPoints: React.Dispatch<React.SetStateAction<[number, number][]>>
}

export default function PolygonDrawHandler({ isDrawing, setPolygonPoints }: PolygonDrawHandlerProps) {
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

  return null
}

