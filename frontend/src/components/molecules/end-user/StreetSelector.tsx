import { useEffect, useMemo, useState } from 'react'
import debounce from 'lodash.debounce'
import { toast } from 'react-toastify'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '../../ui/button'
import type { KmFeature } from '@/models/geoserver'
import { useGeoContext } from '@/contexts/GeoContext'
import {
  findKilometerPost,
  findStreet as findStreetInKmTable,
} from '@/services/street'
import { Label } from '@/components/ui/label'
import FetchingLinesSpinner from '@/components/atoms/FetchingLinesSpinner'

const StreetSelector = () => {
  const queryClient = useQueryClient()
  const { setBusLinesInStreetFilter, setKmFeature } = useGeoContext()
  const [streetName, setStreetName] = useState('')
  const [hasSelectedStreet, setHasSelectedStreet] = useState(false)
  const [suggestions, setSuggestions] = useState<Array<KmFeature>>([])
  const [km, setKm] = useState('')

  const debouncedFetchSuggestions = useMemo(
    () =>
      debounce(async (stName: string) => {
        if (!stName.trim()) {
          setSuggestions([])
          return
        }

        try {
          const streets = await findStreetInKmTable(stName)
          const unique = Array.from(
            new Map(streets.map((s) => [s.properties.routeName, s])).values(),
          )
          setSuggestions(unique)
        } catch {
          setSuggestions([])
        }
      }, 1000),
    [],
  )

  const debouncedFetchKm = useMemo(
    () =>
      debounce(async (kilometer: string, street: string) => {
        if (!street.trim()) return
        if (!kilometer.trim()) {
          setKmFeature(undefined)
          return
        }
        try {
          const feature = await findKilometerPost(street, kilometer)
          setKmFeature(feature)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log(e)
          toast.error(
            'Error al indicar un kilometro, por favor intente de nuevo',
            {
              toastId: 'km-filter-error',
              position: 'top-left',
              closeOnClick: true,
            },
          )
        }
      }, 1000),
    [setKmFeature],
  )

  useEffect(() => {
    debouncedFetchSuggestions(streetName)
    return () => debouncedFetchSuggestions.cancel()
  }, [streetName, debouncedFetchSuggestions])

  useEffect(() => {
    if (streetName) debouncedFetchKm(km, streetName)
    return () => debouncedFetchKm.cancel()
  }, [km, debouncedFetchKm, streetName])

  const handleClear = () => {
    queryClient.removeQueries({ queryKey: ['linesByStreet'] })
    setKmFeature(undefined)
    setBusLinesInStreetFilter(undefined)
    setStreetName('')
    setSuggestions([])
    setHasSelectedStreet(false)
    setKm('')
  }

  const handleApplyFilter = () => {
    if (!hasSelectedStreet) {
      toast.error('Seleccione una ruta válida primero.', {
        toastId: 'street-filter-error',
        position: 'top-left',
      })
      return
    }

    setBusLinesInStreetFilter({
      streetName: streetName,
      km: km,
    })
  }

  const handleSuggestionClick = (suggestion: KmFeature) => {
    setStreetName(suggestion.properties.routeName)
    setSuggestions([])
    setHasSelectedStreet(true)
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md h-fit max-w-[200px]">
      <h3 className="font-semibold">Buscar Líneas por Ruta/KM</h3>
      <input
        type="text"
        value={streetName}
        onChange={(e) => {
          setHasSelectedStreet(false)
          setStreetName(e.target.value)
        }}
        placeholder="Ruta 5"
        className="border p-1 rounded w-full"
      />
      {streetName.trim() && !hasSelectedStreet && (
        <div className="text-xs max-h-24 overflow-y-auto border rounded">
          {suggestions.length > 0 ? (
            <ul>
              {suggestions.map((s, index) => (
                <li
                  key={s.id || index}
                  className="cursor-pointer hover:bg-gray-200 p-1"
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s.properties.routeName}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-red-500 p-2">
              No registramos rutas con ese nombre
            </p>
          )}
        </div>
      )}
      {hasSelectedStreet && (
        <div className="flex flex-col gap-2 w-full">
          <Label
            title="Este campo es opcional"
            className="font-semibold"
            htmlFor="km"
          >
            ⓘ Agregar kilometro
          </Label>
          <input
            type="number"
            id="km"
            className="border p-1 rounded w-full"
            placeholder="Ingrese KM"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            max="1000"
            min={0}
          />
          <FetchingLinesSpinner>
            <Button className="w-full" onClick={handleApplyFilter}>
              Aplicar filtro
            </Button>
            <Button className="bg-red-800 w-full" onClick={handleClear}>
              Limpiar filtro
            </Button>
          </FetchingLinesSpinner>
        </div>
      )}
    </div>
  )
}

export default StreetSelector
