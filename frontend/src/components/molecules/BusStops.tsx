import L from 'leaflet'
import { Marker, useMapEvents } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { useLocation } from '@tanstack/react-router'
import ActiveBusStop from '../../../public/active_bus_stop.png'
import InactiveBusStop from '../../../public/inactive_bus_stop.png'
import type { BusStopFeature } from '@/models/geoserver'
import useStops from '@/hooks/useStops'
import { buildBBoxFilter, buildCqlFilter } from '@/utils/helpers'
import { ADMIN_PATHNAME } from '@/utils/constants'

const ActiveBusStopIcon = L.icon({
  iconUrl: ActiveBusStop,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

const InactiveBusStopIcon = L.icon({
  iconUrl: InactiveBusStop,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

const BusStops = ({
  setActiveStop,
}: {
  setActiveStop: React.Dispatch<React.SetStateAction<BusStopFeature | null>>
}) => {
  const [busStopsCqlFilter, setBusStopsCqlFilter] = useState('')
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds()
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      setBusStopsCqlFilter(buildCqlFilter([buildBBoxFilter({ sw, ne })]))
    },
  })
  const { stops } = useStops(busStopsCqlFilter, true)
  const location = useLocation()

  useEffect(() => {
    const bounds = map.getBounds()
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    setBusStopsCqlFilter(buildCqlFilter([buildBBoxFilter({ sw, ne })]))
  }, [map, setBusStopsCqlFilter])
  //console.log('Filter CQL:', busStopsCqlFilter)
//console.log('Stops:', stops)

  return stops?.map((stop) => {
    return (
      <Marker
        key={stop.id || stop.properties.id}
        position={[stop.geometry.coordinates[1], stop.geometry.coordinates[0]]}
        icon={
          stop.properties.status === 'ACTIVE'
            ? ActiveBusStopIcon
            : InactiveBusStopIcon
        }
        eventHandlers={{
          click: () => {
            setActiveStop(stop)
          },
          dragend: (event) => {
            const position = event.target.getLatLng()
            if (position)
              setActiveStop((prevState) => {
                if (prevState)
                  return {
                    ...prevState,
                    geometry: {
                      type: 'Point',
                      coordinates: [position.lng, position.lat]
                    },
                  }
                else
                  return {
                    ...stop,
                    geometry: {
                      type: 'Point',
                      coordinates: [position.lng, position.lat]
                    },
                  }
              })
          },
        }}
        draggable={location.pathname === ADMIN_PATHNAME}
      ></Marker>
    )
  })
}

export default BusStops
