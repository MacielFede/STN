import { useEffect, useMemo, useRef, useState } from 'react'
import debounce from 'lodash.debounce'
import { toast } from 'react-toastify'
import { Button } from '../../ui/button'
import type { StreetFeature } from '@/models/geoserver'
import { useGeoContext } from '@/contexts/GeoContext'
import { findStreet } from '@/services/street'

const StreetSelector = () => {
  const { setBusLinesInStreetFilter } = useGeoContext()
  const [streetName, setStreetName] = useState('')
  const [hasSelectedStreet, setHasSelectedStreet] = useState(false)
  const [suggestions, setSuggestions] = useState<Array<StreetFeature>>([])
  const selectedStreet = useRef<StreetFeature | null>(null)

  const debouncedFetchSuggestions = useMemo(
    () =>
      debounce(async (stName: string) => {
        if (!stName.trim()) {
          setSuggestions([])
          return
        }

        try {
          const streets = await findStreet(stName)
          const unique = Array.from(
            new Map(
              streets.map((s) => [
                s.properties.name + s.properties.department,
                s,
              ]),
            ).values(),
          )
          setSuggestions(unique)
        } catch {
          setSuggestions([])
        }
      }, 300),
    [],
  )

  useEffect(() => {
    debouncedFetchSuggestions(streetName)
    return () => debouncedFetchSuggestions.cancel()
  }, [streetName, debouncedFetchSuggestions])

  const handleClear = () => {
    setStreetName('')
    setSuggestions([])
    setHasSelectedStreet(false)
    selectedStreet.current = null
    setBusLinesInStreetFilter(undefined)
  }

  const handleApplyFilter = () => {
    const street = selectedStreet.current
    if (!street) {
      toast.error('Seleccione una calle válida primero.', {
        toastId: 'street-filter-error',
        position: 'top-left',
      })
      return
    }

    setBusLinesInStreetFilter({ streetCode: street.properties.streetCode })
  }

  const handleSuggestionClick = (suggestion: StreetFeature) => {
    selectedStreet.current = suggestion
    setStreetName(suggestion.properties.name)
    setSuggestions([])
    setHasSelectedStreet(true)
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md max-w-[18vw] h-fit">
      <h3 className="font-semibold">Buscar Líneas por Calle</h3>
      <input
        type="text"
        value={streetName}
        onChange={(e) => {
          setHasSelectedStreet(false)
          selectedStreet.current = null
          setStreetName(e.target.value)
        }}
        placeholder="Ingrese el nombre de la calle"
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
                  {s.properties.name} | {s.properties.department}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-red-500 p-2">
              No registramos calles con ese nombre
            </p>
          )}
        </div>
      )}
      {streetName !== '' && (
        <div className="flex flex-col gap-2">
          <Button onClick={handleApplyFilter}>Aplicar filtro</Button>
          <Button className="bg-red-800" onClick={handleClear}>
            Limpiar filtro
          </Button>
        </div>
      )}
    </div>
  )
}

export default StreetSelector
