import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import type { BusStopFeature, PointGeometry } from '@/models/geoserver'
import type { BusStopProperties } from '@/models/database'
import { deleteStop, updateStop } from '@/services/busStops'

// Debounce hook
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debounced
}

const BusStopForm = ({ stop }: { stop: BusStopFeature }) => {
  const queryClient = useQueryClient()
  const updateStopMutation = useMutation({
    mutationFn: async (
      data: BusStopProperties & { geometry: PointGeometry },
    ) => {
      try {
        await updateStop(data)
        await queryClient.invalidateQueries({ queryKey: ['stops'] })
        toast.success('Parada actualizada correctamente', {
          closeOnClick: true,
          position: 'top-left',
          toastId: 'update-stop-toast',
        })
      } catch (e) {
        toast.error('Error intentando actualizar la parada', {
          closeOnClick: true,
          position: 'top-left',
          toastId: 'update-stop-toast',
        })
        console.log('Error intentando actualizar la parada: ', e)
      }
    },
  })
  const deleteStopMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        await deleteStop(id)
        await queryClient.invalidateQueries({ queryKey: ['stops'] })
        toast.success('Parada eliminada correctamente', {
          closeOnClick: true,
          position: 'top-left',
          toastId: 'delete-stop-toast',
        })
      } catch (e) {
        toast.error('Error intentando eliminar la parada', {
          closeOnClick: true,
          position: 'top-left',
          toastId: 'delete-stop-toast',
        })
        console.log('Error intentando eliminar la parada: ', e)
      }
    },
  })

  // Input states for immediate user feedback
  const [inputName, setInputName] = useState(stop.properties.name)
  const [inputDescription, setInputDescription] = useState(
    stop.properties.description,
  )

  // Debounced values used for mutation
  const name = useDebounce(inputName, 300)
  const description = useDebounce(inputDescription, 300)

  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>(
    stop.properties.status,
  )
  const [hasShelter, setHasShelter] = useState<boolean>(
    stop.properties.hasShelter,
  )

  // Sync with new `stop` prop
  useEffect(() => {
    setInputName(stop.properties.name)
    setInputDescription(stop.properties.description)
    setStatus(stop.properties.status)
    setHasShelter(stop.properties.hasShelter)
  }, [stop])

  const handleStopUpdate = () => {
    updateStopMutation.mutate({
      id: stop.properties.id,
      name,
      description,
      status,
      hasShelter,
      geometry: stop.geometry,
    })
  }

  const loadingFormAction = useMemo(
    () => updateStopMutation.isPending || deleteStopMutation.isPending,
    [updateStopMutation, deleteStopMutation],
  )

  return (
    <>
      <Label>Paradas</Label>
      <form
        className="flex flex-row justify-between align-middle gap-1 w-full"
        onSubmit={(event) => {
          event.preventDefault()
          handleStopUpdate()
        }}
      >
        <label>
          Nombre:
          <Input
            disabled={loadingFormAction}
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            className="border-black"
          />
        </label>
        <label>
          Descripción:
          <Input
            disabled={loadingFormAction}
            type="text"
            value={inputDescription}
            onChange={(e) => setInputDescription(e.target.value)}
            className="border-black"
          />
        </label>
        <div>
          <label>Estado:</label>
          <div className="flex flex-col gap-1">
            <label>
              <input
                disabled={loadingFormAction}
                type="radio"
                name="status"
                value="ACTIVE"
                checked={status === 'ACTIVE'}
                onChange={() => setStatus('ACTIVE')}
              />
              Activa
            </label>
            <label>
              <input
                disabled={loadingFormAction}
                type="radio"
                name="status"
                value="INACTIVE"
                checked={status === 'INACTIVE'}
                onChange={() => setStatus('INACTIVE')}
              />
              Inactiva
            </label>
          </div>
        </div>
        <div>
          <label>Refugio:</label>
          <div className="flex flex-col gap-1">
            <label>
              <input
                disabled={loadingFormAction}
                type="radio"
                name="hasShelter"
                value="true"
                checked={hasShelter === true}
                onChange={() => setHasShelter(true)}
              />
              Sí
            </label>
            <label>
              <input
                disabled={loadingFormAction}
                type="radio"
                name="hasShelter"
                value="false"
                checked={hasShelter === false}
                onChange={() => setHasShelter(false)}
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
    </>
  )
}

export default BusStopForm
