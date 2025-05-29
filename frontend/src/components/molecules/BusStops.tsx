import L from 'leaflet'
import { Marker, Popup, useMapEvents } from 'react-leaflet'
import { useEffect, useState } from 'react'
import ActiveBusStop from '../../../public/active_bus_stop.png'
import InactiveBusStop from '../../../public/inactive_bus_stop.png'
import AdminPopUp from '../atoms/AdminPopUp'
import type { BBox } from '@/models/geoserver'
import useStops from '@/hooks/useStops'
import { buildBBoxFilter, buildCqlFilter } from '@/utils/helpers'
import { useCqlFilter } from '@/contexts/CqlContext'

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

const BusStops = ({ isAdmin }: { isAdmin: boolean }) => {
  const { cqlFilter, setCqlFilter } = useCqlFilter()
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
        position={[stop.geometry.coordinates[1], stop.geometry.coordinates[0]]}

        
        icon={
          stop.properties.status === 'ACTIVE'
            ? ActiveBusStopIcon
            
            :  InactiveBusStopIcon
        }
      >
        {isAdmin ? (
          <AdminPopUp stop={stop} />
        ) : (
          <Popup>
            <div>
              <strong>{stop.properties.name}</strong>
              <p>{stop.properties.description}</p>
              <p>Estado: {stop.properties.status === 'ACTIVE' ? 'ACTIVA' : 'INACTIVA'}</p>
            </div>
          </Popup>
        )}
      </Marker>
    )
  })
}

export default BusStops
