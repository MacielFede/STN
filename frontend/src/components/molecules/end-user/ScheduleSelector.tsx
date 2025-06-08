import { useState } from 'react'
import { Label } from 'flowbite-react'
import { Button } from '../../ui/button'
import { useGeoContext } from '@/contexts/GeoContext'

const ScheduleSelector = () => {
  const { toogleEndUserFilter, endUserFilters } = useGeoContext()
  const [lowerTime, setLowerTime] = useState<string>('')
  const [upperTime, setUpperTime] = useState<string>('')

  return (
    <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md w-full h-fit">
      <h3 className="font-semibold">Filtrar lineas por horario de salida</h3>
      <div className="flex flex-row justify-between">
        <Label htmlFor="lowerTime">A partir de las:</Label>
        <input
          type="time"
          id="lowerTime"
          value={lowerTime}
          onChange={(e) => setLowerTime(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-row justify-between">
        <Label title="Este campo es opcional" htmlFor="upperTime">
          ⓘ Hasta las:
        </Label>
        <input
          type="time"
          id="upperTime"
          value={upperTime}
          onChange={(e) => setUpperTime(e.target.value)}
          required={false}
          disabled={lowerTime === ''}
        />
      </div>
      {lowerTime !== '' && (
        <Button
          onClick={() =>
            toogleEndUserFilter({
              name: 'schedule',
              isActive: true,
              data: { lowerTime: lowerTime, upperTime: upperTime },
            })
          }
        >
          {endUserFilters.some(
            (filter) => filter.name === 'schedule' && filter.isActive,
          )
            ? 'Actualizar filtro'
            : 'Aplicar filtro'}
        </Button>
      )}
      {lowerTime !== '' && (
        <Button
          className="bg-red-800"
          onClick={() => {
            setLowerTime('')
            setUpperTime('')
            toogleEndUserFilter({ name: 'schedule', isActive: false })
          }}
        >
          Limpiar filtro
        </Button>
      )}
    </div>
  )
}

export default ScheduleSelector
