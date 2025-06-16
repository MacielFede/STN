import { useEffect, useMemo, useState } from 'react'
import { getLines } from '@/services/busLines'
import type { BusLineFeature } from '@/models/geoserver'
import { Button } from '../ui/button'
import { useGeoContext } from "@/contexts/GeoContext"
import useAllLines from '@/hooks/useAllLines'

const BusLineSelector = () => {
  const [busLines, setBusLines] = useState<BusLineFeature[]>([])
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const { toogleEndUserFilter } = useGeoContext()

  const onSearch = () => {
    if (origin || destination) {
      toogleEndUserFilter({
        name: 'origin-destination',
        isActive: true,
        data: { origin, destination },
      })
    }
  }

  useEffect(() => {
    const fetchLines = async () => {
      try {
        const lines = await getLines(' ')
        setBusLines(lines ?? [])
      } catch (e) {
        console.error("Error obteniendo líneas:", e)
        setBusLines([])
      }
    }
    fetchLines()
  }, [])
 
  // const { lines } = useAllLines()
  // setBusLines(lines ?? [])



  const origins = useMemo(() => {
    return Array.from(
      new Set(busLines.map((line) => line.properties.origin))
    )
  }, [busLines])

  const destinations = useMemo(() => {
    return Array.from(
      new Set(
        busLines
          .filter((line) =>
            origin ? line.properties.origin === origin : true
          )
          .map((line) => line.properties.destination)
      )
    )
  }, [busLines, origin])

  const clearFilter = () => {
    setOrigin('')
    setDestination('')
    toogleEndUserFilter({
      name: 'origin-destination',
      isActive: false,
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md w-full">

      <div className="flex flex-col gap-2">
        <label className="font-semibold" htmlFor="origen">
          Origen
        </label>
        <select
          id="origen"
          className="border rounded px-3 py-2"
          value={origin}
          onChange={(e) => {
            setOrigin(e.target.value)
            setDestination('')
          }}
        >
          <option value="">Seleccionar origen</option>
          {origins.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
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
      </div>


          <Button  
          disabled={!origin && !destination}
          onClick={onSearch}
          variant="default"
          >
            Buscar líneas
          </Button>

          {(origin || destination) && (
            <Button 
              onClick={clearFilter}
              variant="destructive"
            >
              Limpiar filtro
            </Button>
          )}
    </div>
  )
}

export default BusLineSelector