import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { BusStopFeature } from '@/models/geoserver'
import { getStops } from '@/services/busStops'

const useStops = (cqlFilter?: string, enabled = false) => {
  const queryClient = useQueryClient()
  const {
    data: stops,
    refetch,
    isLoading,
    isError,
  } = useQuery<Array<BusStopFeature>>({
    queryKey: ['stops', cqlFilter],
    queryFn: () => {
      if (cqlFilter) return getStops(cqlFilter)
      else {
        const cache = queryClient.getQueryData<Array<BusStopFeature>>(['stops'])
        return cache || []
      }
    },
    enabled: !!cqlFilter && enabled,
    staleTime: Infinity,
    retry: 3,
  })

  return {
    stops,
    refetchStops: refetch,
    loadingStops: isLoading,
    errorFetchingStops: isError,
  }
}

export default useStops
