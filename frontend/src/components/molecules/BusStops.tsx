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
import { useBusLineContext } from '@/contexts/BusLineContext'
import { isDestinationStopOnStreet, isIntermediateStopOnStreet, isOriginStopOnStreet } from '@/services/busLines'
import { toast } from 'react-toastify'

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
  const { newBusLine, busLineStep, setBusLineStep, originStop, destinationStop, intermediateStops, cleanStopFromAssignments, setOriginStop, setDestinationStop, setIntermediateStops, cacheStop } = useBusLineContext()
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

  const handleAssoaciationClick = async (stop: BusStopFeature) => {
    const id = stop.properties.id;
    if (!id) return;
    if (busLineStep === 'show-selection-popup') return
    const cleaned = cleanStopFromAssignments(
      id,
      originStop.id,
      destinationStop.id,
      intermediateStops.map((intermediate) => intermediate.id).filter((id): id is number => id !== null)
    );

    setOriginStop({ id: cleaned.newOrigin, estimatedTime: null });
    setDestinationStop({ id: cleaned.newDestination, estimatedTime: null });
    setIntermediateStops(cleaned.newIntermediates.map((id) => ({ id, estimatedTime: null })));

    if (busLineStep === "select-origin") {
      if (!newBusLine) return;
      if (!await isOriginStopOnStreet(stop, newBusLine)) {
        toast.error("La parada seleccionada no es valida como origen de la linea");
        setOriginStop({ id: null, estimatedTime: null });
        return;
      }
      setOriginStop({ id, estimatedTime: null });
      setBusLineStep('show-selection-popup');
      cacheStop(stop);
    } else if (busLineStep === "select-destination") {
      if (!newBusLine) return;
      if (!await isDestinationStopOnStreet(stop, newBusLine)) {
        toast.error("La parada seleccionada no es valida como destino de la linea");
        setDestinationStop({ id: null, estimatedTime: null });
        return;
      }
      setDestinationStop({ id, estimatedTime: null });
      setBusLineStep('show-selection-popup');
      cacheStop(stop);
    } else if (busLineStep === "select-intermediate") {
      if (!newBusLine) return;
      if (!await isIntermediateStopOnStreet(stop, newBusLine)) {
        toast.error("La parada seleccionada no es valida como parada intermedia de la linea");
        setIntermediateStops((prev) => prev.filter((intermediate) => intermediate.id !== id));
        return;
      }
      setIntermediateStops((prev) => [...prev, { id, estimatedTime: null }]);
      cacheStop(stop);
    }
  };

  useEffect(() => {
    const bounds = map.getBounds()
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    setBusStopsCqlFilter(buildCqlFilter([buildBBoxFilter({ sw, ne })]))
  }, [map, setBusStopsCqlFilter])

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
