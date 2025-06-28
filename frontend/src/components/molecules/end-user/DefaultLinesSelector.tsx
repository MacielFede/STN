import { Button } from '../../ui/button'
import { useGeoContext } from '@/contexts/GeoContext'

const DefaultLinesSelector = () => {
  const { setDisplayDefaultLines, displayDefaultLines } = useGeoContext()
  return (
    <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md w-fit max-w-[300px] h-fit">
      <Button
        className="w-full"
        onClick={() => {
          setDisplayDefaultLines(!displayDefaultLines)
        }}
      >
        {`${displayDefaultLines ? 'Ocultar' : 'Mostrar'} lineas cercanas`}
      </Button>
    </div>
  )
}

export default DefaultLinesSelector
