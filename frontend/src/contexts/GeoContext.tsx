import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { EndUserFilter, FilterData } from '@/models/database'
import { buildCqlFilter, getCqlFilterFromData } from '@/utils/helpers'

type GeoContextType = {
  endUserFilters: Array<EndUserFilter>
  toogleEndUserFilter: (filterToToogle: EndUserFilter) => void
  resetBusLineCqlFilter: () => void
  busLinesCqlFilter: string
  busLinesInStreetFilter: { streetCode: string } | undefined
  setBusLinesInStreetFilter: (
    newStreetCode: { streetCode: string } | undefined,
  ) => void
}

const GeoContext = createContext<GeoContextType | undefined>(undefined)

export const GeoProvider = ({ children }: { children: React.ReactNode }) => {
  const [busLinesCqlFilter, setBusLinesCqlFilter] = useState('')
  const [endUserFilters, setEndUserFilters] = useState<Array<EndUserFilter>>([])
  const [busLinesInStreetFilter, setBusLinesInStreetFilter] =
    useState<FilterData['street']>()

  const toogleEndUserFilter = (filterToToogle: EndUserFilter) => {
    const filterExists = endUserFilters.some(
      (filter) => filter.name === filterToToogle.name,
    )
    if (filterExists)
      setEndUserFilters(
        endUserFilters.map((filter) =>
          filter.name === filterToToogle.name ? filterToToogle : filter,
        ),
      )
    else setEndUserFilters([...endUserFilters, filterToToogle])
  }
  const resetBusLineCqlFilter = useCallback(() => {
    setBusLinesCqlFilter('')
  }, [])

  useEffect(() => {
    setBusLinesCqlFilter(
      buildCqlFilter(
        endUserFilters
          .map((filter) =>
            filter.isActive
              ? getCqlFilterFromData({ name: filter.name, data: filter.data })
              : '',
          )
          .filter((filter) => filter !== ''),
      ),
    )
  }, [endUserFilters])

  return (
    <GeoContext.Provider
      value={{
        endUserFilters,
        toogleEndUserFilter,
        resetBusLineCqlFilter,
        busLinesCqlFilter,
        busLinesInStreetFilter,
        setBusLinesInStreetFilter,
      }}
    >
      {children}
    </GeoContext.Provider>
  )
}

export const useGeoContext = () => {
  const context = useContext(GeoContext)
  if (!context) {
    throw new Error('useGeoContext must be used within a GeoProvider')
  }
  return context
}
