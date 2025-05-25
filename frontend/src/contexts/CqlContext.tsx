import React, { createContext, useContext, useState } from 'react'

type CqlFilterContextType = {
  cqlFilter: string
  setCqlFilter: (value: string) => void
  resetCqlFilter: () => void
}

// 1. Create the context
const CqlFilterContext = createContext<CqlFilterContextType | undefined>(
  undefined,
)

// 2. Provider component
export const CqlFilterProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [cqlFilter, setCqlFilter] = useState('')

  const resetCqlFilter = () => setCqlFilter('')

  return (
    <CqlFilterContext.Provider
      value={{ cqlFilter, setCqlFilter, resetCqlFilter }}
    >
      {children}
    </CqlFilterContext.Provider>
  )
}

// 3. Custom hook
export const useCqlFilter = () => {
  const context = useContext(CqlFilterContext)
  if (!context) {
    throw new Error('useCqlFilter must be used within a CqlFilterProvider')
  }
  return context
}
