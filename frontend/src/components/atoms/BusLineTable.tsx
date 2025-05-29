import React from 'react'
import type { BusLineFeature } from '@/models/geoserver'

type BusLineTableProps = {
  lines: BusLineFeature[]
}

const BusLineTable = ({ lines }: BusLineTableProps) => {
  if (lines.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-4">
        No hay líneas disponibles para el origen y destino seleccionados.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left px-4 py-2 border-b">Línea</th>
            <th className="text-left px-4 py-2 border-b">Origen</th>
            <th className="text-left px-4 py-2 border-b">Destino</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b">{line.properties.number}</td>
              <td className="px-4 py-2 border-b">{line.properties.origin}</td>
              <td className="px-4 py-2 border-b">{line.properties.destination}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BusLineTable
