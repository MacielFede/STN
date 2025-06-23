import L from 'leaflet'
import { Marker, useMapEvents } from 'react-leaflet'
import { useCallback, useEffect, useRef } from 'react'
import { useLocation } from '@tanstack/react-router'
import ActiveBusStop from '../../../public/active_bus_stop.png'
import InactiveBusStop from '../../../public/inactive_bus_stop.png'
import type { BusStopFeature } from '@/models/geoserver'
import useStops from '@/hooks/useStops'
import { ADMIN_PATHNAME } from '@/utils/constants'
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
  activeStop,
}: {
  setActiveStop: React.Dispatch<React.SetStateAction<BusStopFeature | null>>
  activeStop: BusStopFeature | null
}) => {
  const { setUserBBox } = useGeoContext()
  const currentZoom = useRef<number | null>(null)
  const map = useMapEvents({
    moveend: () => {
      updateMapBBox()
    },
    zoomend: () => {
      const newZoom = map.getZoom()
      if (currentZoom.current && currentZoom.current > newZoom) {
        updateMapBBox()
      }
      currentZoom.current = newZoom
    },
  })
  const { stops } = useStops(true)
  const location = useLocation()

  const updateMapBBox = useCallback(() => {
    const bounds = map.getBounds()
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    setUserBBox({ sw, ne })
  }, [map, setUserBBox])

  useEffect(() => {
    updateMapBBox()
  }, [updateMapBBox])

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
