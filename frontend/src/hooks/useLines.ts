import { useQuery } from '@tanstack/react-query'
import type { BusLineFeature } from '@/models/geoserver'
import { getLinesByStopId } from '@/services/busLines'

const useLines = (stopId?: number, enabled = false) => {
  const {
    data: lines,
    refetch,
    isLoading,
    isError,
  } = useQuery<Array<BusLineFeature>>({
    queryKey: ['stops', stopId],
    queryFn: () => {
      return stopId ? getLinesByStopId(stopId) : []
    },
    enabled: !!stopId && enabled,
    staleTime: Infinity,
    retry: 3,
  })

  return {
    lines,
    refetchStops: refetch,
    loadingStops: isLoading,
    errorFetchingStops: isError,
  }
}

export default useLines
