import { useEffect, useMemo, useState } from 'react'
import debounce from 'lodash.debounce'
import { Label } from 'flowbite-react'
import { Button } from '../../ui/button'
import type { StreetFeature } from '@/models/geoserver'
import { useGeoContext } from '@/contexts/GeoContext'
import { findStreet } from '@/services/street'

const StreetSelector = () => {
  const { toogleEndUserFilter } = useGeoContext()
  const [street, setStreet] = useState<string>('')
  const [suggestions, setSuggestions] = useState<Array<StreetFeature>>([])

  const debouncedFilter = useMemo(
    () =>
      debounce(async (value: string) => {
        if (value.trim() !== '') {
          try {
            const results = await findStreet(value)
            setSuggestions(results)
          } catch {
            setSuggestions([])
          }
        } else {
          setSuggestions([])
        }
      }, 500),
    [],
  )

  useEffect(() => {
    debouncedFilter(street)
    return () => {
      debouncedFilter.cancel()
    }
  }, [street, debouncedFilter])

  const handleClear = () => {
    setStreet('')
    setSuggestions([])
    toogleEndUserFilter({ name: 'street', isActive: false })
  }

  const handleApplyFilter = () => {
    toogleEndUserFilter({
      name: 'street',
      isActive: true,
      data: { streetName: street },
    })
  }

  const handleSuggestionClick = (suggestion: StreetFeature) => {
    setStreet(suggestion.properties.name)
    setSuggestions([])
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md w-full h-fit">
      <h3 className="font-semibold">Buscar Lineas por Calle</h3>
      <div className="flex flex-row justify-between items-center">
        <Label htmlFor="streetInput">Calle:</Label>
        <input
          type="text"
          id="streetInput"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Ingrese el nombre de la calle"
          className="border p-1 rounded"
        />
      </div>
      {street.trim() !== '' && (
        <>
          {suggestions.length > 0 ? (
            <ul className="mt-2 border rounded p-2 max-h-12 overflow-y-auto">
              {suggestions.map((s, index) => (
                <li
                  key={s.id || index}
                  className="cursor-pointer hover:bg-gray-200 p-1"
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s.properties.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-red-500">
              No hay ninguna calle disponible con ese nombre
            </p>
          )}
          <div className="flex flex-row gap-2">
            <Button className="bg-red-800" onClick={handleClear}>
              Limpiar filtro
            </Button>
            <Button onClick={handleApplyFilter}>Aplicar filtro</Button>
          </div>
        </>
      )}
    </div>
  )
}

export default StreetSelector
