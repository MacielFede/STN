/* eslint-disable no-console */
import { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Label } from 'flowbite-react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import type { PointGeometry, BusStopFeature } from '@/models/geoserver'
import type { BusStopProperties, Department } from '@/models/database'
import { _getStops, createStop, deleteStop, updateStop } from '@/services/busStops'
import { useBusStopContext } from '@/contexts/BusStopContext'
import { useBusLineContext } from '@/contexts/BusLineContext'
import { streetPointContext } from '@/services/busLines'
import { DEPARTMENTS } from '@/utils/constants'
import { geometry } from '@turf/turf'

type PartialBusStopProperties = Omit<BusStopProperties, 'route'>

const BusStopForm = () => {
  const { stop, setStop, cleanUpStopState } = useBusStopContext()
  const { cacheStop, busLineStep, setBusLineStep, setIntermediateStops, newBusLine, sortIntermediateStopsByGeometry } = useBusLineContext()
  const queryClient = useQueryClient()
  const createStopMutation = useMutation({
    mutationFn: async (
      data: PartialBusStopProperties & { geometry: PointGeometry },
    ) => {
      try {
        if (!(data.name && data.description)) {
          toast.error('Debes indicar nombre y observacion de la parada', {
            closeOnClick: true,
            position: 'top-left',
            toastId: 'update-stop-toast-error',
          })
          return
        }
        const stopContext = await streetPointContext({
          lon: data.geometry.coordinates[0],
          lat: data.geometry.coordinates[1],
          isStop: true,
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
        const response = await createStop({
          ...data,
          geometry: {
            type: 'Point',
            coordinates: [
              data.geometry.coordinates[1],
              data.geometry.coordinates[0],
            ],
          },
          route: stopContext.properties.name ?? 'unknown',
        })
        if (busLineStep === 'select-intermediate') {
          cacheStop({
            geometry: {
              type: 'Point',
              coordinates: [
                data.geometry.coordinates[1],
                data.geometry.coordinates[0],
              ],
            },
            properties: {
              ...data,
              id: response.data.id,
              route: stopContext.properties.name,
            },
          });


          const stopsFromApi = await _getStops(`id = ${response.data.id}`);
          const fetchedStop = Array.isArray(stopsFromApi) && stopsFromApi.length > 0 ? stopsFromApi[0] : null;

          setIntermediateStops((prev) => {
            if (!fetchedStop) return prev;
            const updated = [
              ...prev,
              { stop: fetchedStop, estimatedTimes: [] },
            ];
            if (newBusLine?.geometry?.coordinates) {
              return sortIntermediateStopsByGeometry(
                updated.filter((i): i is { stop: BusStopFeature; estimatedTimes: string[]; status?: boolean } => !!i.stop),
                newBusLine.geometry
              );
            }
            return updated;
          });

          setBusLineStep('show-selection-popup');
        }
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
        if (!(data.name && data.description)) {
          toast.error('Debes indicar nombre y observacion de la parada', {
            closeOnClick: true,
            position: 'top-left',
            toastId: 'update-stop-toast-error',
          })
          return
        }
        const stopContext = await streetPointContext({
          lon: data.geometry.coordinates[1],
          lat: data.geometry.coordinates[0],
          isStop: true,
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
          route: stopContext.properties.name ?? 'unknown',
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
        cleanUpStopState()
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
    if (!stop) return
    updateStopMutation.mutate({
      id: stop.properties.id,
      name: stop.properties.name,
      description: stop.properties.description,
      status: stop.properties.status,
      hasShelter: stop.properties.hasShelter,
      direction: stop.properties.direction,
      geometry: stop.geometry,
      department: stop.properties.department,
    })
  }
  const handleCreateStop = () => {
    if (!stop) return
    createStopMutation.mutate({
      name: stop.properties.name,
      description: stop.properties.description,
      status: stop.properties.status,
      hasShelter: stop.properties.hasShelter,
      direction: stop.properties.direction,
      geometry: stop.geometry,
      department: stop.properties.department,
    })
  }

  const loadingFormAction = useMemo(
    () => updateStopMutation.isPending || deleteStopMutation.isPending,
    [updateStopMutation, deleteStopMutation],
  )

  if (!stop) return null
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
            placeholder="Ej. Parada 15"
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
            placeholder="Ej. Necesita mantenimiento"
          />
        </label>
        <div>
          <label>Refugio:</label>
          <div className="flex flex-row gap-1">
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
        <div>
          <label className="flex flex-col gap-1">
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
              className="select select-bordered border-black bg-white"
            >
              <option value="OUTBOUND">Ida</option>
              <option value="INBOUND">Vuelta</option>
              <option value="BIDIRECTIONAL">Circuito</option>
            </select>
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-1">
            Departamento:
            <select
              disabled={loadingFormAction}
              value={stop.properties.department}
              onChange={(e) =>
                updateProperty('department', e.target.value as Department)
              }
              className="select select-bordered border-black bg-white"
            >
              {DEPARTMENTS.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
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
