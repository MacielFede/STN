import { CircleMarker, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { useUserLocation } from '@/hooks/useUserLocation'

const UserPositionIndicator = () => {
  const { position, error } = useUserLocation()
  const map = useMap()

  useEffect(() => {
    if (!error) map.flyTo(position, 13)
  }, [position, map, error])

  return (
    <CircleMarker
      center={position}
      radius={80}
      pathOptions={{
        color: 'skyblue',
        fillColor: 'skyblue',
        fillOpacity: 0.2,
      }}
    />
  )
}

export default UserPositionIndicator
