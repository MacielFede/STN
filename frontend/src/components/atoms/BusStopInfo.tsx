import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import type { BusStopFeature, PointGeometry } from '@/models/geoserver'
import type { BusStopProperties } from '@/models/database'
import { deleteStop, updateStop } from '@/services/busStops'

// Debounce hook
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debounced
}

const BusStopInfo = ({ stop }: { stop: BusStopFeature }) => {
  return (
    <>
      <Label>Paradas</Label>
      <div className="flex flex-row justify-between align-middle gap-1 w-full p-2 border rounded">
        <div>
          <strong>Nombre:</strong>
          <p>{stop.properties.name}</p>
        </div>
        <div>
          <strong>Descripción:</strong>
          <p>{stop.properties.description}</p>
        </div>
        <div>
          <strong>Estado:</strong>
          <p>{stop.properties.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}</p>
        </div>
        <div>
          <strong>Refugio:</strong>
          <p>{stop.properties.hasShelter ? 'Sí' : 'No'}</p>
        </div>
      </div>
    </>
  )
}



export default BusStopInfo
