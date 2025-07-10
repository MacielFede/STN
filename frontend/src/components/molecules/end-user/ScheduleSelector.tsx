import { useState } from 'react'
import { Label } from 'flowbite-react'
import { toast } from 'react-toastify'
import { Button } from '../../ui/button'
import FetchingLinesSpinner from '@/components/atoms/FetchingLinesSpinner'
import { useGeoContext } from '@/contexts/GeoContext'

const ScheduleSelector = () => {
  const { toogleEndUserFilter, endUserFilters } = useGeoContext()
  const [lowerTime, setLowerTime] = useState<string>('')
  const [upperTime, setUpperTime] = useState<string>('')

  return (
    <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md w-fit max-w-[300px] h-fit">
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
        <FetchingLinesSpinner>
          <Button
            className="w-full"
            onClick={() => {
              if (upperTime) {
                const [lowHours, lowMinutes, lowSeconds] = lowerTime
                  .split(':')
                  .map(Number)
                const [upHours, upMinutes, upSeconds] = upperTime
                  .split(':')
                  .map(Number)
                if (
                  lowHours > upHours ||
                  (lowHours === upHours && lowMinutes > upMinutes) ||
                  (lowHours === upHours &&
                    lowMinutes === upMinutes &&
                    lowSeconds > upSeconds)
                ) {
                  toast.error(
                    'El horario inicial debe ser menor que el final en el rango',
                    {
                      position: 'top-left',
                      autoClose: 5000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: 'colored',
                      toastId: 'schedule-error',
                    },
                  )
                  return
                }
              }
              toogleEndUserFilter({
                name: 'schedule',
                isActive: true,
                data: { lowerTime: lowerTime, upperTime: upperTime },
              })
            }}
          >
            {endUserFilters.some(
              (filter) => filter.name === 'schedule' && filter.isActive,
            )
              ? 'Actualizar filtro'
              : 'Aplicar filtro'}
          </Button>
          <Button
            className="bg-red-800 w-full"
            onClick={() => {
              setLowerTime('')
              setUpperTime('')
              toogleEndUserFilter({ name: 'schedule', isActive: false })
            }}
          >
            Limpiar filtro
          </Button>
        </FetchingLinesSpinner>
      )}
    </div>
  )
}

export default ScheduleSelector
