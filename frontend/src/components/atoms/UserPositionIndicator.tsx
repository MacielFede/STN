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
      map.scrollWheelZoom.disable()
      map.doubleClickZoom.disable()
      map.touchZoom.disable()
      map.boxZoom.disable()
      map.keyboard.disable()
      
      const enableZoomControls = () => {
        map.scrollWheelZoom.enable()
        map.doubleClickZoom.enable()
        map.touchZoom.enable()
        map.boxZoom.enable()
        map.keyboard.enable()
        setDisplayDefaultLines(true)
      }
      
      map.once('flyend', enableZoomControls)
      
      map.flyTo(position, 15, { duration: 1 })
      
      const fallbackTimeout = setTimeout(enableZoomControls, 1500)
      
      return () => {
        clearTimeout(fallbackTimeout)
        map.off('flyend', enableZoomControls)
      }
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
