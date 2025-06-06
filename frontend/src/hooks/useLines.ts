import { useQuery } from '@tanstack/react-query'
import { useGeoContext } from '@/contexts/GeoContext'
import { getLines } from '@/services/busLines'

const useLines = () => {
  const { busLinesCqlFilter } = useGeoContext()
  const { data: lines } = useQuery({
    queryKey: ['lines', busLinesCqlFilter],
    queryFn: () => getLines(/* busLinesCqlFilter */),
    enabled: !!busLinesCqlFilter,
  })
  console.log(busLinesCqlFilter)
  console.log(lines)
  return { lines }
}

export default useLines
