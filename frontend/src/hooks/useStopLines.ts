import { useQuery } from '@tanstack/react-query'
import type { BusStopLine } from '@/models/database'
import { getLinesByStop } from '@/services/busLines'

const useStopLines = () => {
  const { data: busStopLines, refetch } = useQuery<Array<BusStopLine>>({
    queryKey: ['busStopLines'],
    queryFn: getLinesByStop,
    enabled: true,
    retry: 3,
  })

  return { busStopLines, refetch }
}

export default useStopLines
