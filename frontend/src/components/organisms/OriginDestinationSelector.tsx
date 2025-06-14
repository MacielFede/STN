import React, { useEffect, useState } from 'react'
import { getLines } from '@/services/busLines'
import type { BusLineFeature } from '@/models/geoserver'
import { Button } from '../ui/button'
import Modal from '@/components/atoms/Modal'
import BusLineTable from '@/components/atoms/BusLineTable' // Ajustá el path si es distinto
import { turnCapitalizedDepartment } from '@/utils/helpers'
import { useGeoContext } from "@/contexts/GeoContext"

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
      const lines = await getLines()
      setBusLines(lines)
    }

    fetchLines()
  }, [])
  

  const origins = Array.from(
    new Set(busLines.map((line) => line.properties.origin))
  )

  const destinations = Array.from(
    new Set(
      busLines
        .filter((line) =>
          origin ? line.properties.origin === origin : true
        )
        .map((line) => line.properties.destination)
    )
  )

  // const filteredLines = busLines.filter(
  //   (line) =>
  //     line.properties.origin === origin &&
  //     line.properties.destination === destination
  // )
  const filteredLines = busLines.filter((line) => {
    const matchOrigin = origin ? line.properties.origin === origin : true
    const matchDestination = destination ? line.properties.destination === destination : true
    return matchOrigin && matchDestination
  })

  return (
    <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md w-full">
      {/* Selectores */}
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

      {/* Botón para abrir el modal */}
      {/* <Modal
        type="busLines"
        trigger={ */}
          <Button  
          disabled={!origin && !destination}
          onClick={onSearch}
          variant="default"
          >
            Buscar líneas
          </Button>
        {/* }
        body={<BusLineTable lines={filteredLines} />}
      /> */}
    </div>
  )
}

export default BusLineSelector
