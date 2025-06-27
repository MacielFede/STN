import L from 'leaflet'
import { Marker, Popup, useMapEvents } from 'react-leaflet'
import { useEffect } from 'react'
import ActiveBusStop from '../../../public/active_bus_stop.png'
import InactiveBusStop from '../../../public/inactive_bus_stop.png'
import type { BusStopFeature } from '@/models/geoserver'
import useStops from '@/hooks/useStops'
import { buildBBoxFilter, buildCqlFilter } from '@/utils/helpers'
import { useGeoContext } from '@/contexts/GeoContext'

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
  setActiveStop: (selectedStop: BusStopFeature | null) => void
}) => {
  const { cqlFilter, setCqlFilter } = useGeoContext()
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds()
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      setCqlFilter(buildCqlFilter(buildBBoxFilter({ sw, ne })))
    },
  })
  const { stops } = useStops(cqlFilter, true)

  useEffect(() => {
    const bounds = map.getBounds()
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    setCqlFilter(buildCqlFilter(buildBBoxFilter({ sw, ne })))
  }, [map, setCqlFilter])

  return stops?.map((stop) => {
    return (
      <Marker
        key={stop.id || stop.properties.id}
        position={stop.geometry.coordinates}
        icon={
          stop.properties.status === 'ACTIVE'
            ? ActiveBusStopIcon
            : InactiveBusStopIcon
        }
        eventHandlers={{
          click: () => {
            setActiveStop(stop)
          },
        }}
      >
        <Popup>
          <div>
            <strong>{stop.properties.name}</strong>
            <p>{stop.properties.description}</p>
            <p>Estado: {stop.properties.status}</p>
          </div>
        </Popup>
      </Marker>
    )
  })
}

export default BusStops
