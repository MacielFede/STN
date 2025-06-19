import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { BusStopFeature } from '@/models/geoserver'
import type { FilterData } from '@/models/database'
import { getStops } from '@/services/busStops'
import { useGeoContext } from '@/contexts/GeoContext'
import {
  buildBBoxFilter,
  buildCqlFilter,
  buildStopStatusFilter,
} from '@/utils/helpers'

const useStops = (enabled = false) => {
  const { endUserFilters, userBBox } = useGeoContext()
  const stopsFilter = useMemo(
    () =>
      buildCqlFilter(
        [
          buildStopStatusFilter(
            (
              endUserFilters.find(
                (filter) => filter.name === 'status' && filter.isActive,
              )?.data as FilterData['status'] | undefined
            )?.stopStatus || '',
          ),
          buildBBoxFilter(userBBox),
        ].filter((f) => f),
      ),
    [endUserFilters, userBBox],
  )
  const {
    data: stops,
    refetch,
    isLoading,
    isError,
  } = useQuery<Array<BusStopFeature>>({
    queryKey: ['stops', stopsFilter],
    queryFn: () => getStops(stopsFilter),
    enabled: !!stopsFilter && enabled,
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
