import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { PointFeature } from '@/models/geoserver'
import { getStops } from '@/services/busStops'

const useStops = (cqlFilter?: string) => {
  const {
    data: stops,
    refetch,
    isLoading,
    isError,
  } = useQuery<Array<PointFeature>>({
    queryKey: ['stops'],
    queryFn: () => getStops(cqlFilter),
    enabled: false,
  })

  useEffect(() => {
    refetch()
  }, [cqlFilter, refetch])

  return {
    stops,
    refetchStops: refetch,
    loadingStops: isLoading,
    errorFetchingStops: isError,
  }
}

export default useStops
