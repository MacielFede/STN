import { createContext, useCallback, useContext, useState } from 'react'
import type { BusStopFeature } from '@/models/geoserver'
import type { ReactNode } from 'react'

interface BusStopContextType {
  stop: BusStopFeature | null
  setStop: React.Dispatch<React.SetStateAction<BusStopFeature | null>>
  cleanUpStopState: () => void
}

const BusStopContext = createContext<BusStopContextType | undefined>(undefined)

export const BusStopProvider = ({ children }: { children: ReactNode }) => {
  const [stop, setStop] = useState<BusStopFeature | null>(null)

  const cleanUpStopState = useCallback(() => {
    setStop(null)
  }, [])

  return (
    <BusStopContext.Provider
      value={{
        stop,
        setStop,
        cleanUpStopState,
      }}
    >
      {children}
    </BusStopContext.Provider>
  )
}

export const useBusStopContext = () => {
  const ctx = useContext(BusStopContext)
  if (!ctx)
    throw new Error('useBusStopContext must be used inside BusStopProvider')
  return ctx
}
