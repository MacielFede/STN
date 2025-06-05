import { Button, Select } from 'flowbite-react'
import type { BusLineFeature, LineStringGeometry } from '@/models/geoserver'
import { Input } from '@/components/ui/input'
import { useBusLineContext } from '@/contexts/BusLineContext'
import type { BusLineProperties } from '@/models/database'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { createBusLine, isBusLineOnStreets } from '@/services/busLines'
import { turnCapitalizedDepartment } from '@/utils/helpers'
import { getCompanies, type Company } from '@/services/admin'
import { useEffect, useState } from 'react'
import StopAssignmentModal from './StopAssignmentDrawer'

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
    updateBusLine,
    newBusLine,
    switchMode,
    setBusLineStep
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
        await createBusLine({
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

  const handleCreateBusLine = () => {
    if (!newBusLine) return;
    createBusLineMutation.mutate({
      ...newBusLine?.properties,
      geometry: newBusLine?.geometry,
    })
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
        handleCreateBusLine();
      }}
    >
      <label>
        Número:
        <Input
          disabled={loadingFormAction}
          type="text"
          value={line.properties.number}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateBusLine({
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
            updateBusLine({
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
            updateBusLine({
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
                updateBusLine({
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
                updateBusLine({
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
            updateBusLine({
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
        <Button disabled={!canSave} onClick={handleDeleted}>
          Eliminar recorrido
        </Button>
        {line.properties.id && (
          <Button
            disabled={loadingFormAction}
            className="bg-red-500 hover:bg-red-700"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault()
              console.log('Deleting line with ID:', line.properties.id)
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
