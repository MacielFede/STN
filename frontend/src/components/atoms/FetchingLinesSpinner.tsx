import type { ReactNode } from 'react'
import useLines from '@/hooks/useLines'
import { useGeoContext } from '@/contexts/GeoContext'

type FetchingLinesSpinnerProps = {
  children: ReactNode
}

const FetchingLinesSpinner = ({ children }: FetchingLinesSpinnerProps) => {
  const { flyToUserLocation, displayDefaultLines } = useGeoContext()
  const { isFetching } = useLines()

  return (
    <div className="flex justify-center items-center flex-col gap-2">
      {(flyToUserLocation && !displayDefaultLines) || isFetching ? (
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500 bg-blue-600"></div>
      ) : (
        children
      )}
    </div>
  )
}

export default FetchingLinesSpinner
