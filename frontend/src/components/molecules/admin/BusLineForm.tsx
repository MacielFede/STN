import { Button } from 'flowbite-react'
import type { BusLineFeature } from '@/models/geoserver'
import { Input } from '@/components/ui/input'
import { useBusLineContext } from '@/contexts/BusLineContext'

const loadingFormAction = false

interface BusLineFormProps {
  line: BusLineFeature
}

const BusLineForm = ({ line }: BusLineFormProps) => {
  const { onEditedRef, onCreationRef, handleDeleted, setNewBusLine, canSave, saveEditedLine, updateBusLine } = useBusLineContext();

  return (
    <form
      className="flex flex-row gap-4 w-full"
      onSubmit={(event) => {
        event.preventDefault()
        if (!line.properties.id) {
          console.log('Creating line:', line.properties)
        } else {
          console.log('Updating line:', line.properties)
        }
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
        <Input
          disabled={loadingFormAction}
          type="number"
          value={line.properties.company_id}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            updateBusLine({
              ...line,
              properties: {
                ...line.properties,
                company_id: parseInt(e.target.value ?? null),
              },
            })
          }}
          className="border-black"
        />
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
