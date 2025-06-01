import React, { createContext, useCallback, useContext, useState } from 'react'

type GeoContextType = {
  cqlFilter: string
  setCqlFilter: (value: string) => void
  resetCqlFilter: () => void
}

const GeoContext = createContext<GeoContextType | undefined>(undefined)

export const GeoProvider = ({ children }: { children: React.ReactNode }) => {
  const [cqlFilter, setCqlFilter] = useState('')

  const resetCqlFilter = useCallback(() => setCqlFilter(''), [setCqlFilter])

  return (
    <GeoContext.Provider
      value={{
        cqlFilter,
        setCqlFilter,
        resetCqlFilter,
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
