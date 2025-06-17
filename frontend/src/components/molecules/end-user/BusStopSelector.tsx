import { useGeoContext } from "@/contexts/GeoContext"
import type { BusStopFeature } from '@/models/geoserver'
import { Marker, Popup } from 'react-leaflet'

type Props = {
  busStops: BusStopFeature[]
}

export default function BusStopSelector({ busStops }: Props) {
  const { toogleEndUserFilter } = useGeoContext()

  function handleClick(stop: BusStopFeature) {
    const stopName = stop.properties.name

    toogleEndUserFilter({
      name: 'stopLine',
      isActive: true,
      data: {
        busStopName: stopName,
      },
    })
  }

  return (
    <>
      {busStops.map((stop) => (
        <Marker
          key={stop.properties.id}
          position={[
            stop.geometry.coordinates[1],
            stop.geometry.coordinates[0],
          ]}
          eventHandlers={{
            click: () => handleClick(stop),
          }}
        >
          <Popup>
            <strong>{stop.properties.name}</strong>
            <br />
            {stop.properties.description}
          </Popup>
        </Marker>
      ))}
    </>
  )
}