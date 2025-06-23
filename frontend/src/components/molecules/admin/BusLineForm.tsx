import { Button, Select } from 'flowbite-react'
import type { BusLineFeature, LineStringGeometry } from '@/models/geoserver'
import { Input } from '@/components/ui/input'
import { useBusLineContext } from '@/contexts/BusLineContext'
import type { BusLineProperties } from '@/models/database'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { isBusLineOnStreets, updateBusLine } from '@/services/busLines'
import { getHoursAndMinutes } from '@/utils/helpers'
import { useEffect, useState } from 'react'
import { getCompanies } from '@/services/companies'
import type { Company } from '@/models/database'

const loadingFormAction = false

interface BusLineFormProps {
  line: BusLineFeature
}

type PartialBusLineProperties = Omit<BusLineProperties, 'department' | 'route'>

const BusLineForm = ({ line }: BusLineFormProps) => {
  const {
    points,
    mode,
    setMode,
    handleDeleted,
    canSave,
    updateBusLineData,
    newBusLine,
    busLineStep,
    setBusLineStep,
    setErrorPoints,
  } = useBusLineContext();
  const [companies, setCompanies] = useState<Array<Company>>([])
  const createBusLineMutation = useMutation({
    mutationFn: async (
      data: PartialBusLineProperties & { geometry: LineStringGeometry },
    ) => {
      try {
        const stopContext = await isBusLineOnStreets(data.geometry);
        if (!stopContext.status || !newBusLine) {
          setErrorPoints(stopContext.errorPoints);
          toast.error(
            'Error intentando crear la ruta, recorrido mal formado o calles no encontradas',
            {
              closeOnClick: true,
              position: 'top-left',
              toastId: 'create-stop-toast-street',
            },
          )
          return
        }
        updateBusLineData({
          ...newBusLine,
          properties: {
            ...newBusLine.properties,
            ...data,
            schedule: getHoursAndMinutes(data.schedule, true),
          },
        });
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
        if (!stopContext.status) {
          setErrorPoints(stopContext.errorPoints);
          toast.error(
            'Error intentando actualizar la ruta, recorrido mal formado o calles no encontradas',
            {
              closeOnClick: true,
              position: 'top-left',
              toastId: 'update-stop-toast-street',
            },
          )
          return
        }
        updateBusLineData(data);
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

  const handleSave = () => {
    if (!newBusLine) return;
    if (!line.properties.id) {
      createBusLineMutation.mutate({
        ...newBusLine?.properties,
        schedule: getHoursAndMinutes(newBusLine.properties.schedule, true),
        geometry: newBusLine?.geometry,
      })
    } else {
      updateBusLineMutation.mutate({
        ...newBusLine,
        properties: {
          ...newBusLine.properties,
          schedule: getHoursAndMinutes(newBusLine.properties.schedule, true),
          id: line.properties.id,
        },
      })
    }
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
          value={getHoursAndMinutes(line.properties.schedule)}
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
        {busLineStep === 'creation' && mode !== 'finished' && (
          <Button disabled={points?.length < 2} onClick={() => setMode('finished')} color="green">
            Finalizar recorrido
          </Button>
        )}
        {busLineStep === 'creation' && mode === 'finished' && (
          <Button disabled={loadingFormAction || !canSave} type="submit" color="green">
            Continuar
          </Button>
        )}
        {mode !== 'editing' && (
          <Button disabled={!newBusLine?.geometry?.coordinates?.length} onClick={() => setMode('editing')}>
            Editar recorrido
          </Button>
        )}
        {mode === 'editing' && (
          <Button disabled={!newBusLine?.geometry?.coordinates?.length} onClick={handleDeleted} className='bg-orange-400 hover:bg-orange-500'>
            Redefinir recorrido
          </Button>
        )}

      </div>
    </form>
  )
}

export default BusLineForm