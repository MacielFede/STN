import React from 'react'

type OriginDestinationSelectorProps = {
  onOriginChange?: (value: string) => void
  onDestinationChange?: (value: string) => void
}

const OriginDestinationSelector = ({
  onOriginChange,
  onDestinationChange,
}: OriginDestinationSelectorProps) => {
  return (
    <nav className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md w-full">
      <div className="flex flex-col gap-2">
        <label htmlFor="origen" className="font-semibold">
          Origen
        </label>
        <select
          id="origen"
          className="border rounded px-3 py-2"
          onChange={(e) => onOriginChange?.(e.target.value)}
        >
          <option value="">Seleccionar origen</option>
          <option value="Montevideo">Montevideo</option>
          <option value="Canelones">Canelones</option>
          <option value="Maldonado">Maldonado</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="destino" className="font-semibold">
          Destino
        </label>
        <select
          id="destino"
          className="border rounded px-3 py-2"
          onChange={(e) => onDestinationChange?.(e.target.value)}
        >
          <option value="">Seleccionar destino</option>
          <option value="Montevideo">Montevideo</option>
          <option value="Canelones">Canelones</option>
          <option value="Maldonado">Maldonado</option>
        </select>
      </div>
    </nav>
  )
}

export default OriginDestinationSelector
