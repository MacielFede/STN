import { useQuery } from '@tanstack/react-query'
import type { BusStopLine } from '@/models/database'
import { getLinesByStop, getStopLines } from '@/services/busLines'

const useStopLines = (stopId?: number) => {
  // Query para obtener todas las relaciones stop-line
  const { data: allBusStopLines, refetch: refetchAll } = useQuery<Array<BusStopLine>>({
    queryKey: ['busStopLines'],
    queryFn: getLinesByStop,
    enabled: true,
    retry: 3,
  })

  // Query para obtener las líneas de una parada específica
  const { data: stopSpecificLines, refetch: refetchStop } = useQuery<Array<BusStopLine>>({
    queryKey: ['stopLines', stopId],
    queryFn: () => stopId ? getStopLines(stopId) : Promise.resolve([]),
    enabled: !!stopId,
    retry: 3,
  })

  return { 
    busStopLines: allBusStopLines, 
    stopSpecificLines,
    refetch: refetchAll,
    refetchStop 
  }
}

export default useStopLines