import { CircleMarker, useMap } from 'react-leaflet'
import { useCallback, useEffect } from 'react'
import { useUserLocation } from '@/hooks/useUserLocation'
import { useGeoContext } from '@/contexts/GeoContext'

const UserPositionIndicator = () => {
  const { position, isInDefaultLocation } = useUserLocation()
  const { setDisplayDefaultLines, flyToUserLocation, setFlyToUserLocation } =
    useGeoContext()
  const map = useMap()

  const enableZoomControls = useCallback(() => {
    map.scrollWheelZoom.enable()
    map.doubleClickZoom.enable()
    map.touchZoom.enable()
    map.boxZoom.enable()
    map.keyboard.enable()
    setDisplayDefaultLines(true)
    setFlyToUserLocation(false)
  }, [map, setDisplayDefaultLines, setFlyToUserLocation])

  useEffect(() => {
    if (!isInDefaultLocation && flyToUserLocation) {
      map.scrollWheelZoom.disable()
      map.doubleClickZoom.disable()
      map.touchZoom.disable()
      map.boxZoom.disable()
      map.keyboard.disable()

      map.once('flyend', enableZoomControls)

      map.flyTo(position, 15, { duration: 1 })

      const fallbackTimeout = setTimeout(enableZoomControls, 1500)

      return () => {
        clearTimeout(fallbackTimeout)
        map.off('flyend', enableZoomControls)
      }
    } else {
      setFlyToUserLocation(false)
    }
  }, [
    position,
    map,
    isInDefaultLocation,
    setDisplayDefaultLines,
    enableZoomControls,
    flyToUserLocation,
    setFlyToUserLocation,
  ])

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
