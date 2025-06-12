import { Button, Select } from 'flowbite-react'
import type { BusLineFeature, LineStringGeometry } from '@/models/geoserver'
import { Input } from '@/components/ui/input'
import { useBusLineContext } from '@/contexts/BusLineContext'
import type { BusLineProperties } from '@/models/database'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { createBusLine, deleteBusLine, deleteStopLine, getStopLineByBusLineId, isBusLineOnStreets, updateBusLine } from '@/services/busLines'
import { turnCapitalizedDepartment } from '@/utils/helpers'
import { useEffect, useState } from 'react'
import StopAssignmentModal from './StopAssignmentDrawer'
import { getCompanies } from '@/services/companies'
import type { Company } from '@/models/database'

const loadingFormAction = false

interface BusLineFormProps {
  line: BusLineFeature
}

type PartialBusLineProperties = Omit<BusLineProperties, 'department' | 'route'>

const BusLineForm = ({ line }: BusLineFormProps) => {
  const {
    onEditedRef,
    onCreationRef,
    handleDeleted,
    canSave,
    saveEditedLine,
    updateBusLineData,
    newBusLine,
    switchMode,
    setBusLineStep,
    cleanUpBusLineStates,
    setOriginStopId,
    setDestinationStopId,
    setIntermediateStopIds
  } = useBusLineContext();
  const [companies, setCompanies] = useState<Array<Company>>([])
  const queryClient = useQueryClient();
  const createBusLineMutation = useMutation({
    mutationFn: async (
      data: PartialBusLineProperties & { geometry: LineStringGeometry },
    ) => {
      try {
        const stopContext = await isBusLineOnStreets(data.geometry);
        if (!stopContext || !newBusLine) {
          toast.error(
            'Error intentando crear la ruta, recorrido mal formado o calles no encontradas',
            {
              closeOnClick: true,
              position: 'top-left',
              toastId: 'create-stop-toast-street',
            },
          )
          switchMode('edition');
          return
        }
        const response = await createBusLine({
          ...newBusLine,
          properties: {
            ...data,
            origin: turnCapitalizedDepartment(
              newBusLine.properties.origin,
            ),
            destination: turnCapitalizedDepartment(
              newBusLine.properties.destination,
            ),
          },
        })
        await queryClient.invalidateQueries({ queryKey: ['bus-lines'] })
        updateBusLineData({
          ...newBusLine,
          properties: {
            ...newBusLine.properties,
            id: response.data.id,
          },
        })
        toast.success('Ruta creada correctamente', {
          closeOnClick: true,
          position: 'top-left',
          toastId: 'create-route-toast',
        })
        setBusLineStep('show-selection-popup');
      } catch (error) {
        toast.error('Error intentando crear la ruta', {
          closeOnClick: true,
          position: 'top-left',
          toastId: 'create-route-toast-error',
        })
        console.log('Error intentando crear la ruta: ', error)
      }
    },
  })
  const updateBusLineMutation = useMutation({
    mutationFn: async (data: BusLineFeature) => {
      try {
        const stopContext = await isBusLineOnStreets(data.geometry);
        if (!stopContext) {
          toast.error(
            'Error intentando actualizar la ruta, recorrido mal formado o calles no encontradas',
            {
              closeOnClick: true,
              position: 'top-left',
              toastId: 'update-stop-toast-street',
            },
          )
          switchMode('edition');
          return
        }
        await queryClient.invalidateQueries({ queryKey: ['bus-lines'] })
        await updateBusLine(newBusLine ?? line);
        updateBusLineData(data);

        const associations = await getStopLineByBusLineId(String(data.properties.id));
        if (associations.length > 0) {
          associations.forEach(async (association) => {
            await deleteStopLine(String(association.id));
          });
          setBusLineStep('show-selection-popup');
          toast.success('Recorrido actualizado correctamente', {
            closeOnClick: true,
            position: 'top-left',
            toastId: 'update-stop-toast',
          })
          return;
        }
        toast.success('Recorrido actualizada correctamente', {
          closeOnClick: true,
          position: 'top-left',
          toastId: 'update-line-toast',
        });
        setOriginStopId(null);
        setDestinationStopId(null);
        setIntermediateStopIds([]);
        setBusLineStep('show-selection-popup');
      } catch (error) {
        toast.error('Error al actualizar la línea', {
          closeOnClick: true,
          position: 'top-left',
          toastId: 'update-line-toast-error',
        })
        console.error('Error al actualizar la línea:', error)
      }
    },
  })
  const deleteBusLineMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const stopsAssociations = await getStopLineByBusLineId(id);

        stopsAssociations.forEach(async (association) => {
          await deleteStopLine(String(association.id));
        });

        await queryClient.invalidateQueries({ queryKey: ['bus-lines'] })
        await queryClient.invalidateQueries({ queryKey: ['stops'] })

        await deleteBusLine(id);
        toast.success('Línea eliminada correctamente', {
          closeOnClick: true,
          position: 'top-left',
          toastId: 'delete-line-toast',
        })
        cleanUpBusLineStates();
      } catch (error) {
        toast.error('Error al eliminar la línea', {
          closeOnClick: true,
          position: 'top-left',
          toastId: 'delete-line-toast-error',
        })
        cleanUpBusLineStates();
        console.error('Error al eliminar la línea:', error)
      }
    },
  })

  const handleSave = () => {
    if (!newBusLine) return;
    if (!line.properties.id) {
      createBusLineMutation.mutate({
        ...newBusLine?.properties,
        geometry: newBusLine?.geometry,
      })
    } else {
      updateBusLineMutation.mutate({
        ...newBusLine,
        properties: {
          ...newBusLine.properties,
          id: line.properties.id,
        },
      })
    }
  }

  const handleDeleteBusLine = () => {
    if (!newBusLine) return;
    if (!line.properties.id) return;
    deleteBusLineMutation.mutate(String(line.properties.id));
  }


  useEffect(() => {
    getCompanies().then((data) => setCompanies(data))
      .catch((error) => {
        console.error('Error fetching companies:', error);
        toast.error('Error al cargar las empresas', {
          closeOnClick: true,
          position: 'top-left',
        });
      });
  }, []);

  return (
    <form
      className="flex flex-row gap-4 w-full"
      onSubmit={(event) => {
        event.preventDefault()
        handleSave();
      }}
    >
      <label>
        Número:
        <Input
          disabled={loadingFormAction}
          type="text"
          value={line.properties.number}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateBusLineData({
              ...line,
              properties: {
                ...line.properties,
                number: e.target.value,
              },
            })
          }
          className="border-black"
        />
      </label>
      <label>
        Origen:
        <Input
          disabled={loadingFormAction}
          type="text"
          value={line.properties.origin}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateBusLineData({
              ...line,
              properties: {
                ...line.properties,
                origin: e.target.value,
              },
            })
          }
          className="border-black"
        />
      </label>
      <label>
        Destino:
        <Input
          disabled={loadingFormAction}
          type="text"
          value={line.properties.destination}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateBusLineData({
              ...line,
              properties: {
                ...line.properties,
                destination: e.target.value,
              },
            })
          }
          className="border-black"
        />
      </label>
      <label>
        Horario de salida:
        <Input
          disabled={loadingFormAction}
          type="time"
          value={line.properties.schedule}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // Convert HH:MM to HH:MM:SS format
            const timeValue = e.target.value;
            const timeWithSeconds = timeValue.includes(':') && timeValue.split(':').length === 2
              ? `${timeValue}:00`
              : timeValue;

            updateBusLineData({
              ...line,
              properties: {
                ...line.properties,
                schedule: timeWithSeconds,
              },
            })
          }}
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
              checked={line.properties.status === 'ACTIVE'}
              onChange={() => {
                updateBusLineData({
                  ...line,
                  properties: {
                    ...line.properties,
                    status: 'ACTIVE',
                  },
                })
              }}
            />
            Activa
          </label>
          <label>
            <input
              disabled={loadingFormAction}
              type="radio"
              name="status"
              value="INACTIVE"
              checked={line.properties.status === 'INACTIVE'}
              onChange={() => {
                updateBusLineData({
                  ...line,
                  properties: {
                    ...line.properties,
                    status: 'INACTIVE',
                  },
                })
              }}
            />
            Inactiva
          </label>
        </div>
      </div>
      <label>
        Empresa:
        <Select
          disabled={loadingFormAction}
          value={line.properties.companyId ?? ''}
          onChange={(e) => {
            if (!newBusLine) return;
            const companyId = Number(e.target.value) === 0 ? null : Number(e.target.value);
            updateBusLineData({
              ...newBusLine,
              properties: {
                ...newBusLine.properties,
                companyId: companyId ?? null,
              },
            })
          }}
        >
          <option value="">Seleccione una empresa</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </Select>
      </label>
      <div className="flex gap-2 mt-2">
        {onCreationRef.current && onEditedRef.current && (
          <Button disabled={loadingFormAction || !canSave} onClick={saveEditedLine}>
            Finalizar recorrido
          </Button>
        )}
        {onCreationRef.current && !onEditedRef.current && (
          <Button disabled={loadingFormAction || !canSave} type="submit">
            Guardar cambios
          </Button>
        )}
        {!line.properties.id && (
          <Button disabled={!canSave} onClick={handleDeleted}>
            Eliminar recorrido
          </Button>
        )}
        {line.properties.id && (
          <Button
            disabled={loadingFormAction}
            className="bg-red-500 hover:bg-red-700"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault()
              handleDeleteBusLine();
            }}
          >
            Eliminar línea
          </Button>
        )}
      </div>
    </form>

  )
}

export default BusLineForm
