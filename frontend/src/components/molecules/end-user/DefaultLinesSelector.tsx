import { Button } from '../../ui/button'
import { useUserLocation } from '@/hooks/useUserLocation'
import { useGeoContext } from '@/contexts/GeoContext'
import FetchingLinesSpinner from '@/components/atoms/FetchingLinesSpinner'

const DefaultLinesSelector = () => {
  const {
    setDisplayDefaultLines,
    displayDefaultLines,
    flyToUserLocation,
    setFlyToUserLocation,
  } = useGeoContext()
  const { isInDefaultLocation } = useUserLocation()

  return isInDefaultLocation ? null : (
    <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md w-fit max-w-[300px] h-fit">
      <h3 className="font-semibold">Lineas cercanas</h3>
      <FetchingLinesSpinner>
        <Button
          className="w-full"
          onClick={() => {
            if (flyToUserLocation || displayDefaultLines) {
              setDisplayDefaultLines(false)
              setFlyToUserLocation(false)
            } else {
              setFlyToUserLocation(true)
            }
          }}
        >
          {displayDefaultLines || flyToUserLocation ? 'Ocultar' : 'Mostrar'}
        </Button>
      </FetchingLinesSpinner>
    </div>
  )
}

export default DefaultLinesSelector
