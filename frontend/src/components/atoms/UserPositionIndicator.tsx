import { CircleMarker, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { useUserLocation } from '@/hooks/useUserLocation'
import { DEFAULT_COORDINATES } from '@/utils/constants'
import { useGeoContext } from '@/contexts/GeoContext'

const UserPositionIndicator = () => {
  const { position, error } = useUserLocation()
  const { setDisplayDefaultLines } = useGeoContext()
  const map = useMap()

  useEffect(() => {
    if (!error && !Object.is(position, DEFAULT_COORDINATES)) {
      map.flyTo(position, 15, { duration: 1 })
      setTimeout(() => {
        setDisplayDefaultLines(true)
      }, 1500)
    }
  }, [position, map, error, setDisplayDefaultLines])

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
