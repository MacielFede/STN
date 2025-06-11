import { useEffect, useMemo, useState } from 'react'
import debounce from 'lodash.debounce'
import { toast } from 'react-toastify'
import { Button } from '../../ui/button'
import type { StreetFeature } from '@/models/geoserver'
import { useGeoContext } from '@/contexts/GeoContext'
import { findStreet } from '@/services/street'

const StreetSelector = () => {
  const { toogleEndUserFilter } = useGeoContext()
  const [streetName, setStreetName] = useState<string>('')
  const [selectedStreet, setSelectedStreet] = useState<StreetFeature | null>(
    null,
  )
  const [suggestions, setSuggestions] = useState<Array<StreetFeature>>([])

  const debouncedFilter = useMemo(
    () =>
      debounce(async (value: string) => {
        if (value.trim() !== '') {
          try {
            const results = Array.from(
              new Map(
                (await findStreet(value)).map((street) => [
                  street.properties.name,
                  street,
                ]),
              ).values(),
            )
            setSuggestions(results)
            return results[0]
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
    debouncedFilter(streetName)
    return () => {
      debouncedFilter.cancel()
    }
  }, [streetName, debouncedFilter])

  const handleClear = () => {
    setStreetName('')
    setSuggestions([])
    setSelectedStreet(null)
    toogleEndUserFilter({ name: 'street', isActive: false })
  }

  const handleApplyFilter = async () => {
    let firstStreetFound
    if (selectedStreet) {
      toogleEndUserFilter({
        name: 'street',
        data: { coordinates: selectedStreet.geometry.coordinates },
        isActive: true,
      })
    } else {
      firstStreetFound = await debouncedFilter(streetName)
      if (firstStreetFound === undefined) {
        toast.error('No tenemos registrada una calle con ese nombre', {
          position: 'top-left',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
          toastId: 'street-filter-error',
        })
        return
      }
      setSelectedStreet(firstStreetFound)
      toogleEndUserFilter({
        name: 'street',
        data: { coordinates: firstStreetFound.geometry.coordinates },
        isActive: true,
      })
    }
  }

  const handleSuggestionClick = (suggestion: StreetFeature) => {
    setSelectedStreet(suggestion)
    setStreetName(suggestion.properties.name)
    setSuggestions([])
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md max-w-fit h-fit">
      <h3 className="font-semibold">Buscar Lineas por Calle</h3>
      <div className="flex flex-row justify-between items-center">
        <input
          type="text"
          id="streetInput"
          value={streetName}
          onChange={(e) => {
            setSelectedStreet(null)
            setStreetName(e.target.value)
          }}
          placeholder="Ingrese el nombre de la calle"
          className="border p-1 rounded"
        />
      </div>
      {streetName.trim() !== '' && (
        <>
          {selectedStreet === null &&
            (suggestions.length > 0 ? (
              <ul className="border rounded p-2 max-h-24 overflow-y-auto">
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
            ))}
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
