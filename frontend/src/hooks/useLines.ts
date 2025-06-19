import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { BusLineFeature } from '@/models/geoserver'
import { useGeoContext } from '@/contexts/GeoContext'
import { getLines, getLinesInStreet } from '@/services/busLines'
import { filterAndSortLinesByDistance } from '@/utils/helpers'

const useLines = () => {
  const { busLinesCqlFilter, busLinesInStreetFilter, busLineNearUserFilter } =
    useGeoContext()
  const [lines, setLines] = useState<Array<BusLineFeature>>([])
  const { data: linesByCql } = useQuery({
    queryKey: ['linesByCql', busLinesCqlFilter],
    queryFn: () => getLines(busLinesCqlFilter),
    enabled: !!busLinesCqlFilter,
  })

  const { data: linesByStreetCode } = useQuery({
    queryKey: ['linesByStreet', busLinesInStreetFilter?.streetCode],
    queryFn: () => getLinesInStreet(busLinesInStreetFilter?.streetCode),
    enabled: !!busLinesInStreetFilter,
  })

  useEffect(() => {
    let linesToSet
    if (!linesByCql || linesByCql.length === 0)
      linesToSet = linesByStreetCode || []
    else if (!linesByStreetCode || linesByStreetCode.length === 0)
      linesToSet = linesByCql
    else {
      const mapedCqlLines = new Map(
        linesByCql.map((line) => [line.properties.id, line]),
      )
      const mapedStreetLines = new Map(
        linesByStreetCode.map((line) => [line.properties.id, line]),
      )
      const result = new Map<number, BusLineFeature>()

      mapedStreetLines.forEach((value, key) => {
        if (mapedCqlLines.has(key)) result.set(key, value)
      })
      linesToSet = Array.from(result.values())
    }

    const newLines = busLineNearUserFilter
      ? filterAndSortLinesByDistance(
          busLineNearUserFilter.userLocation,
          linesToSet,
        )
      : linesToSet
    setLines(newLines)
  }, [linesByStreetCode, linesByCql, busLineNearUserFilter])

  return { lines }
}

export default useLines
