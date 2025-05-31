import { Popup } from 'react-leaflet'
import { useMemo, useRef, useState } from 'react'
import { Button } from '../ui/button'
import type { BusStopFeature, PointGeometry } from '@/models/geoserver'
import useStops from '@/hooks/useStops'

const AdminPopUp = ({ stop }: { stop: BusStopFeature }) => {
  const formRef = useRef<HTMLFormElement>(null)
  const [oldHasShelter, setOldHasShelter] = useState(stop.properties.hasShelter)
  const [oldStatus, setOldStatus] = useState(stop.properties.status)
  const { updateStopMutation, deleteStopMutation } = useStops()

  const handleStopUpdate = (
    event: React.FormEvent<HTMLFormElement>,
    stopId: number,
    geometry: PointGeometry,
  ) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = {
      id: stopId,
      name: (form.elements.namedItem(`name-${stopId}`) as HTMLInputElement)
        .value,
      description: (
        form.elements.namedItem(`description-${stopId}`) as HTMLInputElement
      ).value,
      status: (form.elements.namedItem(`status-${stopId}`) as RadioNodeList)
        .value as 'ACTIVE' | 'INACTIVE',
      hasShelter:
        (form.elements.namedItem(`hasShelter-${stopId}`) as RadioNodeList)
          .value === 'true',
      geometry,
    }
    updateStopMutation.mutate(data)
  }

  const loadingFormAction = useMemo(
    () => updateStopMutation.isPending || deleteStopMutation.isPending,
    [updateStopMutation, deleteStopMutation],
  )

  return (
    <Popup
      eventHandlers={{
        remove: () => {
          formRef.current?.reset()
        },
      }}
    >
      <form
        className="flex flex-col gap-1"
        onSubmit={(event) =>
          handleStopUpdate(event, stop.properties.id, stop.geometry)
        }
        ref={formRef}
      >
        <label>
          Nombre:
          <input
            disabled={loadingFormAction}
            type="text"
            name={`name-${stop.properties.id}`}
            defaultValue={stop.properties.name}
          />
        </label>
        <label>
          Descripción:
          <input
            disabled={loadingFormAction}
            type="text"
            name={`description-${stop.properties.id}`}
            defaultValue={stop.properties.description}
          />
        </label>
        <div>
          <label>Estado:</label>
          <div>
            <label>
              <input
                disabled={loadingFormAction}
                type="radio"
                name={`status-${stop.properties.id}`}
                value="ACTIVE"
                checked={oldStatus === 'ACTIVE'}
                onChange={() => setOldStatus('ACTIVE')}
              />
              Activa
            </label>
            <label>
              <input
                disabled={loadingFormAction}
                type="radio"
                name={`status-${stop.properties.id}`}
                value="INACTIVE"
                checked={oldStatus === 'INACTIVE'}
                onChange={() => setOldStatus('INACTIVE')}
              />
              Inactiva
            </label>
          </div>
        </div>
        <div>
          <label>Refugio:</label>
          <div>
            <label>
              <input
                disabled={loadingFormAction}
                type="radio"
                name={`hasShelter-${stop.properties.id}`}
                value="true"
                checked={oldHasShelter === true}
                onChange={() => setOldHasShelter(true)}
              />
              Si
            </label>
            <label>
              <input
                disabled={loadingFormAction}
                type="radio"
                name={`hasShelter-${stop.properties.id}`}
                value="false"
                checked={oldHasShelter === false}
                onChange={() => setOldHasShelter(false)}
              />
              No
            </label>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Button disabled={loadingFormAction} type="submit">
            Guardar cambios
          </Button>
          <Button
            disabled={loadingFormAction}
            className="bg-red-500"
            onClick={(event) => {
              event.preventDefault()
              deleteStopMutation.mutate(stop.properties.id)
            }}
          >
            Eliminar parada
          </Button>
        </div>
      </form>
    </Popup>
  )
}

export default AdminPopUp
