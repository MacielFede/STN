import React, { useEffect, useState } from 'react'
import { getLines } from '@/services/busLines'
import type { BusLineFeature } from '@/models/geoserver'
import { Button } from '../ui/button'
import Modal from '@/components/molecules/Modal'
import BusLineTable from '@/components/atoms/BusLineTable' // Ajustá el path si es distinto

const BusLineSelector = () => {
  const [busLines, setBusLines] = useState<BusLineFeature[]>([])
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

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
        .filter((line) => line.properties.origin === origin)
        .map((line) => line.properties.destination)
    )
  )

  const filteredLines = busLines.filter(
    (line) =>
      line.properties.origin === origin &&
      line.properties.destination === destination
  )

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
          disabled={!origin}
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
      <Modal
        type="busLines"
        trigger={
          <Button onClick={() => setModalOpen(true)} disabled={!origin || !destination}>
            Buscar líneas
          </Button>
        }
        body={<BusLineTable lines={filteredLines} />}
      />
    </div>
  )
}

export default BusLineSelector
