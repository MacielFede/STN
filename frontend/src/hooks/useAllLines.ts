import { useQuery } from '@tanstack/react-query'
import { getLines } from '@/services/busLines'

const useAllLines = () => {
  const { data: lines } = useQuery({
    queryKey: ['allLines'],
    queryFn: () => getLines(), // sin filtros
  })

  return { lines }
}

export default useAllLines
