import L from 'leaflet'
import { Marker, useMapEvents } from 'react-leaflet'
import { useEffect } from 'react'
import { useLocation } from '@tanstack/react-router'
import ActiveBusStop from '../../../public/active_bus_stop.png'
import InactiveBusStop from '../../../public/inactive_bus_stop.png'
import type { BusStopFeature } from '@/models/geoserver'
import useStops from '@/hooks/useStops'
import { buildBBoxFilter, buildCqlFilter } from '@/utils/helpers'
import { useGeoContext } from '@/contexts/GeoContext'
import { ADMIN_PATHNAME } from '@/utils/constants'
import { useBusLineContext } from '@/contexts/BusLineContext'

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
  const { cqlFilter, setCqlFilter } = useGeoContext()
  const { busLineStep, setBusLineStep, originStopId, destinationStopId, intermediateStopIds, cleanStopFromAssignments, setOriginStopId, setDestinationStopId, setIntermediateStopIds } = useBusLineContext()
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds()
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      setCqlFilter(buildCqlFilter(buildBBoxFilter({ sw, ne })))
    },
  })
  const { stops } = useStops(cqlFilter, true)
  const location = useLocation()

  const handleAssoaciationClick = (stop: BusStopFeature) => {
    const id = stop.properties.id;
    if (!id) return;
    if(busLineStep === 'show-selection-popup') return
    const cleaned = cleanStopFromAssignments(id, originStopId, destinationStopId, intermediateStopIds);

    setOriginStopId(cleaned.newOrigin);
    setDestinationStopId(cleaned.newDestination);
    setIntermediateStopIds(cleaned.newIntermediates);

    if (busLineStep === "select-origin") {
      setOriginStopId(id);
      setBusLineStep('show-selection-popup');
    } else if (busLineStep === "select-destination") {
      setDestinationStopId(id);
      setBusLineStep('show-selection-popup');
    } else if (busLineStep === "select-intermediate") {
      setIntermediateStopIds([...cleaned.newIntermediates, id]);
    }
  };

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
            if (busLineStep === null) {
              setActiveStop(stop)
            }
            else {
              handleAssoaciationClick(stop)
            }
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
                      coordinates: [position.lat, position.lng]
                    },
                  }
                else
                  return {
                    ...stop,
                    geometry: {
                      type: 'Point',
                      coordinates: [position.lat, position.lng]
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
