import { useQuery } from '@tanstack/react-query'
import type { Company } from '@/models/database'
import { getCompanies } from '@/services/companies'

const useCompanies = () => {
  const { data: companies, refetch } = useQuery<Array<Company>>({
    queryKey: ['companies'],
    queryFn: getCompanies,
    enabled: true,
    retry: 3,
  })

  return { companies, refetch }
}

export default useCompanies