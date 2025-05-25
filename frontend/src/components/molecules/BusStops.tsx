import L from 'leaflet'
import { Marker, Popup, useMapEvents } from 'react-leaflet'
import { useMemo, useState } from 'react'
import ActiveBusStop from '../../../public/active_bus_stop.png'
import type { BBox } from '@/models/geoserver'
import useStops from '@/hooks/useStops'
import { buildBBoxFilter, buildCqlFilter } from '@/utils/helpers'

const BusStops = () => {
  const [bBox, setBBox] = useState<BBox>({
    sw: undefined,
    ne: undefined,
  })
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds()
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      setBBox({ sw, ne })
    },
  })
  const { stops } = useStops(buildCqlFilter(buildBBoxFilter(bBox)))

  const busStopIcon = useMemo(
    () =>
      L.icon({
        iconUrl: ActiveBusStop,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
    [],
  )

  return stops?.map((stop) => {
    return (
      <Marker
        key={stop.id || stop.properties.id}
        position={stop.geometry.coordinates}
        icon={busStopIcon}
      >
        <Popup>
          <strong>{stop.properties.name}</strong>
          <p>{stop.properties.description}</p>
          <p>Status: {stop.properties.status}</p>
        </Popup>
      </Marker>
    )
  })
}

export default BusStops
