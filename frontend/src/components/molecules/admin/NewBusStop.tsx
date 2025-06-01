import L from 'leaflet'
import { booleanEqual } from '@turf/boolean-equal'
import { point } from '@turf/helpers'
import { Marker, useMap } from 'react-leaflet'
import { useMemo } from 'react'
import NewBusStop from '../../../public/new_bus_stop_icon.png'
import type { BusStopFeature, PointGeometry } from '@/models/geoserver'
import { BASIC_STOP_FEATURE, DEFAULT_COORDINATES } from '@/utils/constants'

const NewBusStopIcon = L.icon({
  iconUrl: NewBusStop,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

const NewBusStopComponent = ({
  setNewStop,
  newStopGeom,
}: {
  setNewStop: React.Dispatch<React.SetStateAction<BusStopFeature | null>>
  newStopGeom: PointGeometry
}) => {
  const map = useMap()
  const isDefCoord = useMemo(() => {
    const newStopPoint = point(newStopGeom.coordinates)
    const defaultPoint = point(DEFAULT_COORDINATES)
    return booleanEqual(newStopPoint, defaultPoint)
  }, [newStopGeom.coordinates])

  return (
    <Marker
      key={'new_stop'}
      position={isDefCoord ? map.getCenter() : newStopGeom.coordinates}
      icon={NewBusStopIcon}
      draggable
      eventHandlers={{
        dragend: (event) => {
          const position = event.target.getLatLng()
          if (position)
            setNewStop((prevState) => {
              if (prevState)
                return {
                  ...prevState,
                  geometry: {
                    type: 'Point',
                    coordinates: [position.lat, position.lng],
                  },
                }
              else
                return {
                  ...BASIC_STOP_FEATURE,
                  geometry: {
                    type: 'Point',
                    coordinates: [position.lat, position.lng],
                  },
                }
            })
        },
        load: (event) => {
          const position = event.target.getLatLng()
          if (position)
            setNewStop((prevState) => {
              if (prevState)
                return {
                  ...prevState,
                  geometry: {
                    type: 'Point',
                    coordinates: [position.lat, position.lng],
                  },
                }
              else
                return {
                  ...BASIC_STOP_FEATURE,
                  geometry: {
                    type: 'Point',
                    coordinates: [position.lat, position.lng],
                  },
                }
            })
        },
      }}
    />
  )
}

export default NewBusStopComponent
