import L from 'leaflet'
import { Marker, useMapEvents } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { useLocation } from '@tanstack/react-router'
import ActiveBusStop from '../../../public/active_bus_stop.png'
import InactiveBusStop from '../../../public/inactive_bus_stop.png'
import type { BusStopFeature } from '@/models/geoserver'
import useStops from '@/hooks/useStops'
import { ADMIN_PATHNAME } from '@/utils/constants'
import { useBusLineContext } from '@/contexts/BusLineContext'
import { isDestinationStopOnStreet, isIntermediateStopOnStreet, isOriginStopOnStreet } from '@/services/busLines'
import { toast } from 'react-toastify'
import { useGeoContext } from '@/contexts/GeoContext'
import { buildBBoxFilter, buildCqlFilter } from '@/utils/helpers'

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
  activeStop,
}: {
  setActiveStop: React.Dispatch<React.SetStateAction<BusStopFeature | null>>
  activeStop: BusStopFeature | null
}) => {
  const [busStopsCqlFilter, setBusStopsCqlFilter] = useState('')
  const { addPoint, setPoints, newBusLine, busLineStep, setBusLineStep, originStop, destinationStop, intermediateStops, cleanStopFromAssignments, setOriginStop, setDestinationStop, setIntermediateStops, cacheStop, sortIntermediateStopsByGeometry } = useBusLineContext()
  const { setUserBBox } = useGeoContext()
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds()
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      setUserBBox({ sw, ne })
    },
  })
  const { stops } = useStops(true)
  const location = useLocation()

  const handleAssociationClick = async (stop: BusStopFeature) => {
    const id = stop.properties.id;
    if (!id) return;
    if (busLineStep === 'show-selection-popup') return
    const cleaned = cleanStopFromAssignments(
      id,
      originStop.stop?.id,
      destinationStop.stop?.id,
      intermediateStops.map((intermediate) => intermediate.stop?.properties.id ?? null)
    );

    setOriginStop((prev) => ({
      ...prev,
      stop: { ...prev.stop, id: cleaned.newOrigin },
      estimatedTimes: [prev.estimatedTimes[0] || ''],
    }));
    setDestinationStop((prev) => ({
      ...prev,
      stop: { ...prev.stop, id: cleaned.newDestination },
      estimatedTimes: [prev.estimatedTimes[0] || ''],
    }));
    setIntermediateStops((prev) =>
      prev.map((intermediate) => ({
        ...intermediate,
        stop: cleaned.newIntermediates.includes(intermediate.stop?.properties?.id || null)
          ? intermediate.stop
          : null,
      }))
    );

    if (busLineStep === "select-origin") {
      if (!newBusLine) return;
      if (!await isOriginStopOnStreet(stop, newBusLine)) {
        toast.error("La parada seleccionada no es valida como origen de la linea");
        setOriginStop({ stop: null, estimatedTimes: [] });
        return;
      }
      setOriginStop((prev) => ({
        ...prev,
        stop: { ...stop, id: cleaned.newOrigin },
        estimatedTimes: [prev.estimatedTimes[0] || ''],
      }));
      setBusLineStep('show-selection-popup');
      cacheStop(stop);
    } else if (busLineStep === "select-destination") {
      if (!newBusLine) return;
      if (!await isDestinationStopOnStreet(stop, newBusLine)) {
        toast.error("La parada seleccionada no es valida como destino de la linea");
        setDestinationStop({ stop: null, estimatedTimes: [] });
        return;
      }
      setDestinationStop((prev) => ({
        ...prev,
        stop: { ...stop, id: cleaned.newDestination },
        estimatedTimes: [prev.estimatedTimes[0] || ''],
      }));
      setBusLineStep('show-selection-popup');
      cacheStop(stop);
    } else if (busLineStep === "select-intermediate") {
      if (!newBusLine) return;
      if (!await isIntermediateStopOnStreet(stop, newBusLine)) {
        toast.error("La parada seleccionada no es valida como parada intermedia de la linea");
        setIntermediateStops((prev) => prev.filter((intermediate) => intermediate.stop?.properties.id !== id));
        setBusLineStep('show-selection-popup')
        return;
      }
      setIntermediateStops((prev) => {
        const updated = [...prev, { stop: stop, estimatedTimes: [] }];
        if (newBusLine.geometry?.coordinates) {
          return sortIntermediateStopsByGeometry(updated);
        }
        return updated;
      });
      cacheStop(stop);
      setBusLineStep('show-selection-popup')
    }
  };

  useEffect(() => {
    const bounds = map.getBounds()
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    setBusStopsCqlFilter(buildCqlFilter([buildBBoxFilter({ sw, ne })]))
  }, [map, setBusStopsCqlFilter])
  //console.log('Filter CQL:', busStopsCqlFilter)
  //console.log('Stops:', stops)

  return stops && stops.length > 0
    ? stops.map((stop) => {
      return (
        <Marker
          key={stop.id || stop.properties.id}
          position={
            activeStop && stop.properties.id === activeStop.properties.id
              ? [
                activeStop.geometry.coordinates[1],
                activeStop.geometry.coordinates[0],
              ]
              : [stop.geometry.coordinates[1], stop.geometry.coordinates[0]]
          }
          icon={
            stop.properties.status === 'ACTIVE'
              ? ActiveBusStopIcon
              : InactiveBusStopIcon
          }
          eventHandlers={{
            click: () => {
              if (newBusLine === null) {
              setActiveStop(stop)
              return;
            }
            if (busLineStep === 'creation') {
              addPoint(stop.geometry.coordinates[0], stop.geometry.coordinates[1])
              return;
            }
            if (busLineStep === 'select-intermediate') {
              handleAssociationClick(stop)
              return;
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
                        coordinates: [position.lng, position.lat],
                      },
                    }
                  else
                    return {
                      ...stop,
                      geometry: {
                        type: 'Point',
                        coordinates: [position.lng, position.lat],
                      },
                    }
                })
            },
          }}
          draggable={location.pathname === ADMIN_PATHNAME}
        />
      )
    })
    : activeStop && (
      <Marker
        key={activeStop.id || activeStop.properties.id}
        position={[
          activeStop.geometry.coordinates[1],
          activeStop.geometry.coordinates[0],
        ]}
        icon={
          activeStop.properties.status === 'ACTIVE'
            ? ActiveBusStopIcon
            : InactiveBusStopIcon
        }
        eventHandlers={{
          dragend: (event) => {
            const position = event.target.getLatLng()
            if (position)
              setActiveStop({
                ...activeStop,
                geometry: {
                  type: 'Point',
                  coordinates: [position.lng, position.lat],
                },
              })
          },
        }}
        draggable={location.pathname === ADMIN_PATHNAME}
      />
    )
}

export default BusStops
