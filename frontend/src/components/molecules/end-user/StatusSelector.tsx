import { useState } from 'react'
import { Label } from 'flowbite-react'
import { toast } from 'react-toastify'
import { Button } from '../../ui/button'
import type { StatusOptions } from '@/models/database'
import { useGeoContext } from '@/contexts/GeoContext'
import FetchingLinesSpinner from '@/components/atoms/FetchingLinesSpinner'

const StatusSelector = () => {
  const { toogleEndUserFilter, endUserFilters } = useGeoContext()
  const [linesOption, setSelectedLineas] = useState<StatusOptions>('')
  const [stopsOption, setSelectedParadas] = useState<StatusOptions>('')

  return (
    <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md w-fit max-w-[300px] h-fit">
      <h3 className="font-semibold">Filtrar por estado</h3>
      <div>
        <Label className="font-semibold">Lineas</Label>
        <div className="flex flex-col">
          <Label className="flex items-center gap-2">
            <input
              type="radio"
              name="lineas"
              value="ACTIVE"
              checked={linesOption === 'ACTIVE'}
              onChange={(e) =>
                setSelectedLineas(e.target.value as StatusOptions)
              }
            />
            Habilitadas
          </Label>
          <Label className="flex items-center gap-2">
            <input
              type="radio"
              name="lineas"
              value="INACTIVE"
              checked={linesOption === 'INACTIVE'}
              onChange={(e) =>
                setSelectedLineas(e.target.value as StatusOptions)
              }
            />
            Deshabilitadas
          </Label>
        </div>
      </div>
      <div>
        <Label className="font-semibold">Paradas</Label>
        <div className="flex flex-col">
          <Label className="flex items-center gap-2">
            <input
              type="radio"
              name="paradas"
              value="ACTIVE"
              checked={stopsOption === 'ACTIVE'}
              onChange={(e) =>
                setSelectedParadas(e.target.value as StatusOptions)
              }
            />
            Habilitadas
          </Label>
          <Label className="flex items-center gap-2">
            <input
              type="radio"
              name="paradas"
              value="INACTIVE"
              checked={stopsOption === 'INACTIVE'}
              onChange={(e) =>
                setSelectedParadas(e.target.value as StatusOptions)
              }
            />
            Deshabilitadas
          </Label>
        </div>
      </div>
      {(linesOption || stopsOption) && (
        <FetchingLinesSpinner>
          <Button
            className="w-full"
            onClick={() => {
              if (linesOption === '' && stopsOption === '') {
                toast.error('Seleccione al menos una opción para filtrar', {
                  position: 'top-left',
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: 'colored',
                })
                return
              }
              toogleEndUserFilter({
                name: 'status',
                data: { lineStatus: linesOption, stopStatus: stopsOption },
                isActive: true,
              })
            }}
          >
            {endUserFilters.some(
              (filter) => filter.name === 'status' && filter.isActive,
            )
              ? 'Actualizar filtro'
              : 'Aplicar filtro'}
          </Button>
          <Button
            className="bg-red-800 hover:bg-red-900 w-full"
            onClick={() => {
              setSelectedLineas('')
              setSelectedParadas('')
              toogleEndUserFilter({ name: 'status', isActive: false })
            }}
          >
            Limpiar filtro
          </Button>
        </FetchingLinesSpinner>
      )}
    </div>
  )
}

export default StatusSelector
