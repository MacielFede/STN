import { useQuery } from '@tanstack/react-query'
import { getLines } from '@/services/busLines'

const useAllLines = () => {
  const { data: lines } = useQuery({
    queryKey: ['allLines'],
    queryFn: () => getLines(''),
  })

  return { lines }
}

export default useAllLines
