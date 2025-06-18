import { CircleMarker, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { useUserLocation } from '@/hooks/useUserLocation'

const UserPositionIndicator = () => {
  const position = useUserLocation()
  const map = useMap()

  useEffect(() => {
    map.flyTo(position, 13)
  }, [position, map])

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
