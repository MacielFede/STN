import { useQuery } from '@tanstack/react-query'
import type { GeoServerFeature } from '@/models/geoserver'
import { getStops } from '@/services/bus_tops'

const useStops = (enabled: boolean) => {
  const {
    data: stops,
    refetch,
    isLoading,
    isError,
  } = useQuery<Array<GeoServerFeature>>({
    queryKey: ['stops'],
    queryFn: getStops,
    enabled,
  })

  return {
    stops,
    refetchStops: refetch,
    loadingStops: isLoading,
    errorFetchingStops: isError,
  }
}

export default useStops
