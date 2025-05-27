import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { BusStopFeature, PointGeometry } from '@/models/geoserver'
import type { BusStopProperties } from '@/models/database'
import { deleteStop, getStops, updateStop } from '@/services/busStops'

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

  const updateStopMutation = useMutation({
    mutationFn: async (
      data: BusStopProperties & { geometry: PointGeometry },
    ) => {
      try {
        await updateStop(data)
        await queryClient.invalidateQueries({ queryKey: ['stops'] })
        toast.success('Parada actualizada correctamente', {
          closeOnClick: true,
          position: 'top-left',
          toastId: 'update-stop-toast',
        })
      } catch (e) {
        toast.error('Error intentando actualizar la parada', {
          closeOnClick: true,
          position: 'top-left',
          toastId: 'update-stop-toast',
        })
        // eslint-disable-next-line no-console
        console.log('Error intentando actualizar la parada: ', e)
      }
    },
  })

  const deleteStopMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        await deleteStop(id)
        queryClient.invalidateQueries({ queryKey: ['stops'] })
        toast.success('Parada eliminada correctamente', {
          closeOnClick: true,
          position: 'top-left',
          toastId: 'delete-stop-toast',
        })
      } catch (e) {
        toast.error('Error intentando eliminar la parada', {
          closeOnClick: true,
          position: 'top-left',
          toastId: 'delete-stop-toast',
        })
        // eslint-disable-next-line no-console
        console.log('Error intentando eliminar la parada: ', e)
      }
    },
  })

  return {
    stops,
    refetchStops: refetch,
    loadingStops: isLoading,
    errorFetchingStops: isError,
    updateStopMutation,
    deleteStopMutation,
  }
}

export default useStops
