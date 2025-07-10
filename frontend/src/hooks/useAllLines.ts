import { useQuery } from '@tanstack/react-query'
import { getLines } from '@/services/busLines'

const useAllLines = () => {
  const { data: lines, refetch } = useQuery({
    queryKey: ['allLines'],
    queryFn: () => getLines(''),
  })

  return { lines, refetchAllLines: refetch }
}

export default useAllLines
