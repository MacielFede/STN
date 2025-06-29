import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { EndUserFilter, FilterData } from '@/models/database'
import type { BBox, KmFeature } from '@/models/geoserver'
import { buildCqlFilter, getLinesCqlFilterFromData } from '@/utils/helpers'

type GeoContextType = {
  endUserFilters: Array<EndUserFilter>
  toogleEndUserFilter: (filterToToogle: EndUserFilter) => void
  resetBusLineCqlFilter: () => void
  busLinesCqlFilter: string
  busLinesInStreetFilter: FilterData['street'] | undefined
  setBusLinesInStreetFilter: (
    newStreetCode: FilterData['street'] | undefined,
  ) => void
  busLineNearUserFilter: FilterData['location'] | undefined
  setBusLineNearUserFilter: (
    newUserLocation: FilterData['location'] | undefined,
  ) => void
  userBBox: BBox
  setUserBBox: (newBBox: BBox) => void
  displayDefaultLines: boolean
  setDisplayDefaultLines: (toogleDefaultLines: boolean) => void
  kmFeature: KmFeature | undefined
  setKmFeature: (newKm: KmFeature | undefined) => void
}

const GeoContext = createContext<GeoContextType | undefined>(undefined)

export const GeoProvider = ({ children }: { children: React.ReactNode }) => {
  const [displayDefaultLines, setDisplayDefaultLines] = useState<boolean>(false)
  const [userBBox, setUserBBox] = useState<BBox>({})
  const [busLinesCqlFilter, setBusLinesCqlFilter] = useState('')
  const [endUserFilters, setEndUserFilters] = useState<Array<EndUserFilter>>([])
  const [busLinesInStreetFilter, setBusLinesInStreetFilter] =
    useState<FilterData['street']>()
  const [busLineNearUserFilter, setBusLineNearUserFilter] =
    useState<FilterData['location']>()
  const [kmFeature, setKmFeature] = useState<KmFeature | undefined>()

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
              ? getLinesCqlFilterFromData({
                  name: filter.name,
                  data: filter.data,
                })
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
        busLineNearUserFilter,
        setBusLineNearUserFilter,
        userBBox,
        setUserBBox,
        displayDefaultLines,
        setDisplayDefaultLines,
        kmFeature,
        setKmFeature,
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
