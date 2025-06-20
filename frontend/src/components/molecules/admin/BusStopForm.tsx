/* eslint-disable no-console */
import { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Button } from '../../ui/button'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import type { BusStopFeature, PointGeometry } from '@/models/geoserver'
import type { BusStopProperties, Department } from '@/models/database'
import { createStop, deleteStop, updateStop } from '@/services/busStops'
import { streetContext } from '@/services/street'
import { turnCapitalizedDepartment } from '@/utils/helpers'

type PartialBusStopProperties = Omit<BusStopProperties, 'department' | 'route'>

interface BusStopFormProps {
  stop: BusStopFeature
  setStop: React.Dispatch<React.SetStateAction<BusStopFeature | null>>
  resetActiveStop: () => void
}

const BusStopForm = ({ stop, setStop, resetActiveStop }: BusStopFormProps) => {
  const queryClient = useQueryClient()
  const createStopMutation = useMutation({
    mutationFn: async (
      data: PartialBusStopProperties & { geometry: PointGeometry },
    ) => {
      try {
        const stopContext = await streetContext({
          lon: data.geometry.coordinates[1],
          lat: data.geometry.coordinates[0],
        })
        if (!stopContext) {
          toast.error(
            'Error intentando actualizar la parada, calle no encontrada',
            {
              closeOnClick: true,
              position: 'top-left',
              toastId: 'create-stop-toast-street',
            },
          )
          return
        }
        await createStop({
          ...data,
          geometry:{
            type: 'Point',
            coordinates: [data.geometry.coordinates[1], data.geometry.coordinates[0]]
          },
          department: turnCapitalizedDepartment(
            stopContext.properties.department,
          ) as Department,
          route: stopContext.properties.name,
        })
        setStop(null)
        await queryClient.invalidateQueries({ queryKey: ['stops'] })
        toast.success('Parada creada correctamente', {
          closeOnClick: true,
          position: 'top-left',
          toastId: 'create-stop-toast',
        })
      } catch (error) {
        toast.error('Error intentando crear la parada', {
          closeOnClick: true,
          position: 'top-left',
          toastId: 'create-stop-toast-error',
        })
        console.log('Error intentando crear la parada: ', error)
      }
    },
  })
  const updateStopMutation = useMutation({
    mutationFn: async (
      data: PartialBusStopProperties & { geometry: PointGeometry },
    ) => {
      try {
        const stopContext = await streetContext({
          lon: data.geometry.coordinates[1],
          lat: data.geometry.coordinates[0],
        })
        if (!stopContext) {
          toast.error(
            'Error intentando actualizar la parada, calle no encontrada',
            {
              closeOnClick: true,
              position: 'top-left',
              toastId: 'update-stop-toast-street',
            },
          )
          return
        }
        await updateStop({
          ...data,
          geometry:{
            type: 'Point',
            coordinates: [data.geometry.coordinates[1], data.geometry.coordinates[0]]
          },
          department: turnCapitalizedDepartment(
            stopContext.properties.department,
          ) as Department,
          route: stopContext.properties.name,
        })
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
          toastId: 'update-stop-toast-error',
        })
        console.log('Error intentando actualizar la parada: ', e)
      }
    },
  })
  const deleteStopMutation = useMutation({
    mutationFn: async (id?: number) => {
      if (!id) return
      try {
        await deleteStop(id)
        resetActiveStop()
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

  // Functions to update parent's stop state on change
  const updateProperty = <TKey extends keyof BusStopProperties>(
    key: TKey,
    value: BusStopProperties[TKey],
  ): void => {
    setStop((prev) => {
      if (!prev) return null
      return {
        ...prev,
        properties: {
          ...prev.properties,
          [key]: value,
        },
        geometry: prev.geometry,
      }
    })
  }

  const handleStopUpdate = () => {
    updateStopMutation.mutate({
      id: stop.properties.id,
      name: stop.properties.name,
      description: stop.properties.description,
      status: stop.properties.status,
      hasShelter: stop.properties.hasShelter,
      direction: stop.properties.direction,
      geometry: stop.geometry,
    })
  }
  const handleCreateStop = () => {
    createStopMutation.mutate({
      name: stop.properties.name,
      description: stop.properties.description,
      status: stop.properties.status,
      hasShelter: stop.properties.hasShelter,
      direction: stop.properties.direction,
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
        className="flex flex-row gap-2 w-full align-top justify-between"
        onSubmit={(event) => {
          event.preventDefault()
          if (!stop.properties.id) handleCreateStop()
          else handleStopUpdate()
        }}
      >
        <label>
          Nombre:
          <Input
            disabled={loadingFormAction}
            type="text"
            value={stop.properties.name}
            onChange={(e) => updateProperty('name', e.target.value)}
            className="border-black"
          />
        </label>
        <label>
          Observaciones:
          <Input
            disabled={loadingFormAction}
            type="text"
            value={stop.properties.description}
            onChange={(e) => updateProperty('description', e.target.value)}
            className="border-black"
          />
        </label>
       {/*< div>
          <label>Estado:</label>
          <div className="flex flex-col gap-1">
            <label>
              <input
                disabled={loadingFormAction}
                type="radio"
                name="status"
                value="ACTIVE"
                checked={stop.properties.status === 'ACTIVE'}
                onChange={() => updateProperty('status', 'ACTIVE')}
              />
              Activa
            </label>
            <label>
              <input
                disabled={loadingFormAction}
                type="radio"
                name="status"
                value="INACTIVE"
                checked={stop.properties.status === 'INACTIVE'}
                onChange={() => updateProperty('status', 'INACTIVE')}
              />
              Inactiva
            </label>
          </div>
        </div> */}
        <div>
          <label>Refugio:</label>
          <div className="flex flex-col gap-1">
            <label>
              <input
                disabled={loadingFormAction}
                type="radio"
                name="hasShelter"
                value="true"
                checked={stop.properties.hasShelter}
                onChange={() => updateProperty('hasShelter', true)}
              />
              Sí
            </label>
            <label>
              <input
                disabled={loadingFormAction}
                type="radio"
                name="hasShelter"
                value="false"
                checked={!stop.properties.hasShelter}
                onChange={() => updateProperty('hasShelter', false)}
              />
              No
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label>
            Dirección:
            <select
              disabled={loadingFormAction}
              value={stop.properties.direction}
              onChange={(e) =>
                updateProperty(
                  'direction',
                  e.target.value as 'OUTBOUND' | 'INBOUND' | 'BIDIRECTIONAL',
                )
              }
              className="select select-bordered border-black"
            >
              <option value="OUTBOUND">Ida</option>
              <option value="INBOUND">Vuelta</option>
              <option value="BIDIRECTIONAL">Circuito</option>
            </select>
          </label>
        </div>
        <div className="flex gap-2 mt-2">
          <Button disabled={loadingFormAction} type="submit">
            Guardar cambios
          </Button>
          {stop.properties.id && (
            <Button
              disabled={loadingFormAction}
              className="bg-red-500 hover:bg-red-700"
              onClick={(event) => {
                event.preventDefault()
                deleteStopMutation.mutate(stop.properties.id)
              }}
            >
              Eliminar parada
            </Button>
          )}
        </div>
      </form>
    </>
  )
}

export default BusStopForm
