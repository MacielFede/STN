import { CircleMarker, Popup } from 'react-leaflet'

interface UserPositionMarkerProps {
  position: [number, number]
}

export function UserPositionMarker({ position }: UserPositionMarkerProps) {
  return (
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
  )
}
