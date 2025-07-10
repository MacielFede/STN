import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useUserLocation } from './useUserLocation'
import type { BusLineFeature } from '@/models/geoserver'
import { useGeoContext } from '@/contexts/GeoContext'
import { getLines, getLinesInStreet } from '@/services/busLines'
import {
  buildDwithinFilter,
  filterAndSortLinesByDistance,
} from '@/utils/helpers'

const useLines = () => {
  const {
    busLinesCqlFilter,
    busLinesInStreetFilter,
    busLineNearUserFilter,
    displayDefaultLines,
  } = useGeoContext()
  const [lines, setLines] = useState<Array<BusLineFeature>>([])
  const { position } = useUserLocation()
  const { data: linesByCql, isLoading: isFetchingByCqlFilter } = useQuery({
    queryKey: ['linesByCql', busLinesCqlFilter],
    queryFn: () => getLines(busLinesCqlFilter),
    enabled: !!busLinesCqlFilter,
  })

  const { data: linesByStreetName, isLoading: isFetchingByStreet } = useQuery({
    queryKey: [
      'linesByStreet',
      busLinesInStreetFilter?.streetName,
      busLinesInStreetFilter?.km,
    ],
    queryFn: () =>
      getLinesInStreet(
        busLinesInStreetFilter?.streetName,
        busLinesInStreetFilter?.km,
      ),
    enabled: !!busLinesInStreetFilter,
  })

  const { data: defaultLines, isLoading: isFetchingDefaultLines } = useQuery({
    queryKey: ['defaultLines', displayDefaultLines],
    queryFn: () => {
      if (displayDefaultLines) {
        return getLines(buildDwithinFilter(position))
      }
      return []
    },
  })

  useEffect(() => {
    let linesToSet: Array<BusLineFeature> | undefined
    if (!busLinesCqlFilter) linesToSet = linesByStreetName || []
    else if (!busLinesInStreetFilter) linesToSet = linesByCql
    else {
      const mapedCqlLines = new Map(
        linesByCql?.map((line) => [line.properties.id, line]),
      )
      const mapedStreetLines = new Map(
        linesByStreetName?.map((line) => [line.properties.id, line]),
      )
      const result = new Map<number, BusLineFeature>()

      mapedStreetLines.forEach((value, key) => {
        if (mapedCqlLines.has(key)) result.set(key, value)
      })
      linesToSet = Array.from(result.values())
    }
    if (linesToSet === undefined) linesToSet = []
    setLines(
      busLineNearUserFilter
        ? filterAndSortLinesByDistance(
            busLineNearUserFilter.userLocation,
            linesToSet,
          )
        : linesToSet,
    )
  }, [
    linesByStreetName,
    linesByCql,
    busLineNearUserFilter,
    busLinesCqlFilter,
    busLinesInStreetFilter,
  ])

  return {
    lines:
      displayDefaultLines && !!defaultLines?.length && defaultLines.length > 0
        ? defaultLines
        : lines,
    isFetching:
      isFetchingByCqlFilter || isFetchingByStreet || isFetchingDefaultLines,
  }
}

export default useLines
