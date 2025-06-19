import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { useGeoContext } from '@/contexts/GeoContext'
import useAllLines from '@/hooks/useAllLines'
import { useUserLocation } from '@/hooks/useUserLocation'

const BusLineSelector = () => {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)
  const { lines } = useAllLines()
  const { toogleEndUserFilter, setBusLineNearUserFilter } = useGeoContext()
  const { position: userLocation, error: locationError } = useUserLocation()

  useEffect(() => {
    if (locationError) {
      toast.error(
        'No se pudo obtener tu ubicación. Por favor, revisa los permisos.',
        {
          position: 'top-left',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
          toastId: 'location-error-reminder',
        },
      )
    }
  }, [locationError])

  const onSearch = () => {
    toogleEndUserFilter({
      name: 'origin-destination',
      isActive: true,
      data: { origin, destination },
    })
    if (useCurrentLocation && !locationError) {
      setBusLineNearUserFilter({
        userLocation: { coordinates: userLocation, type: 'Point' },
      })
    }
  }

  const origins = useMemo(() => {
    return Array.from(new Set(lines?.map((line) => line.properties.origin)))
  }, [lines])

  const destinations = useMemo(() => {
    return Array.from(
      new Set(
        lines
          ?.filter((line) =>
            origin ? line.properties.origin === origin : true,
          )
          .map((line) => line.properties.destination),
      ),
    )
  }, [lines, origin])

  const clearFilter = () => {
    setOrigin('')
    setDestination('')
    setUseCurrentLocation(false)
    toogleEndUserFilter({
      name: 'origin-destination',
      isActive: false,
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md w-min">
      <div className="flex flex-col gap-2">
        <label className="font-semibold" htmlFor="origen">
          Origen
        </label>
        <select
          id="origen"
          className={`border rounded px-3 py-2 ${useCurrentLocation ? 'bg-gray-300 cursor-not-allowed' : ''}`}
          value={origin}
          onChange={(e) => {
            setOrigin(e.target.value)
            setDestination('')
          }}
          disabled={useCurrentLocation}
        >
          <option value="">Seleccionar origen</option>
          {origins.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="useLocation"
            checked={useCurrentLocation}
            onChange={(e) => {
              const checked = e.target.checked
              setUseCurrentLocation(checked)
              if (checked) {
                setOrigin('')
              }
            }}
          />
          <Label className="font-semibold" htmlFor="useLocation">
            Usar mi ubicacion actual
          </Label>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold" htmlFor="destino">
          Destino
        </label>
        <select
          id="destino"
          className="border rounded px-3 py-2"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        >
          <option value="">Seleccionar destino</option>
          {destinations
            .filter((opt) => opt !== origin)
            .map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
        </select>
        {useCurrentLocation && destination === '' && (
          <p className="text-red-500 text-sm text-balance ">
            Debe seleccionar un destino al usar su ubicación
          </p>
        )}
      </div>
      {(useCurrentLocation ? destination : origin || destination) && (
        <>
          <Button
            disabled={!!locationError}
            onClick={onSearch}
            variant={locationError ? 'destructive' : 'default'}
          >
            Buscar líneas
          </Button>

          <Button onClick={clearFilter} variant="destructive">
            Limpiar filtro
          </Button>
        </>
      )}
    </div>
  )
}

export default BusLineSelector
