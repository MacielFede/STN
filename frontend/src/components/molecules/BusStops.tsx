import L from 'leaflet'
import { Marker, Popup, useMapEvents } from 'react-leaflet'
import { useEffect, useMemo, useState } from 'react'
import ActiveBusStop from '../../../public/active_bus_stop.png'
import InactiveBusStop from '../../../public/inactive_bus_stop.png'
import type { BBox } from '@/models/geoserver'
import useStops from '@/hooks/useStops'
import { buildBBoxFilter, buildCqlFilter } from '@/utils/helpers'

const BusStops = ({ isAdmin }: { isAdmin: boolean }) => {
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
  const activeBusStopIcon = useMemo(
    () =>
      L.icon({
        iconUrl: ActiveBusStop,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
    [],
  )
  const inactiveBusStopIcon = useMemo(
    () =>
      L.icon({
        iconUrl: InactiveBusStop,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
    [],
  )

  const handleStopUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // const formData = {
    //   id: stop.id || stop.properties.id,
    //   name: stop.properties.name,
    //   description: stop.properties.description,
    //   status: stop.properties.status,
    //   sheltered: stop.properties.sheltered,
    //   geometry: stop.geometry,
    // }
    // Replace this with the actual server function call
    console.log('Submitting data to server:')
  }

  const handleStopUpdateCanceled = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    event.currentTarget.reset()
    console.log('cierro pop up')
  }

  useEffect(() => {
    const bounds = map.getBounds()
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    console.log({ sw, ne })
    setBBox({ sw, ne })
  }, [setBBox, map])

  return stops?.map((stop) => {
    return (
      <Marker
        key={stop.id || stop.properties.id}
        position={stop.geometry.coordinates}
        icon={
          stop.properties.status === 'active'
            ? activeBusStopIcon
            : inactiveBusStopIcon
        }
      >
        <Popup
          eventHandlers={{
            remove: () => {
              console.log('cierro pop up')
            },
          }}
        >
          {isAdmin ? (
            <form
              className="flex flex-col gap-1"
              onSubmit={handleStopUpdate}
              onReset={handleStopUpdateCanceled}
            >
              <label>
                Name:
                <input
                  type="text"
                  defaultValue={stop.properties.name}
                  onChange={(e) => {
                    stop.properties.name = e.target.value
                  }}
                />
              </label>
              <label>
                Description:
                <input
                  type="text"
                  defaultValue={stop.properties.description}
                  onChange={(e) => {
                    stop.properties.description = e.target.value
                  }}
                />
              </label>
              <div>
                <label>Status:</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name={`status-${stop.id}`}
                      value="active"
                      checked={stop.properties.status === 'active'}
                      onChange={() => {
                        stop.properties.status = 'active'
                      }}
                    />
                    Activa
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`status-${stop.id}`}
                      value="inactive"
                      checked={stop.properties.status === 'inactive'}
                      onChange={() => {
                        stop.properties.status = 'inactive'
                      }}
                    />
                    Inactiva
                  </label>
                </div>
              </div>
              <div>
                <label>Sheltered:</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name={`sheltered-${stop.id}`}
                      value="true"
                      checked={stop.properties.sheltered === true}
                      onChange={() => {
                        stop.properties.sheltered = true
                      }}
                    />
                    Si
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`sheltered-${stop.id}`}
                      value="false"
                      checked={stop.properties.sheltered === false}
                      onChange={() => {
                        stop.properties.sheltered = false
                      }}
                    />
                    No
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit">Guardar cambios</button>
                <button type="reset">Cancelar</button>
              </div>
            </form>
          ) : (
            <div>
              <strong>{stop.properties.name}</strong>
              <p>{stop.properties.description}</p>
              <p>Status: {stop.properties.status}</p>
            </div>
          )}
        </Popup>
      </Marker>
    )
  })
}

export default BusStops
