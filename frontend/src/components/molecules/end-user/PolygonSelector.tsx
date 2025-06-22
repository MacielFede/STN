import { Button } from '@/components/ui/button'
import { useGeoContext } from '@/contexts/GeoContext'
import FetchingLinesSpinner from '@/components/atoms/FetchingLinesSpinner'

function PolygonSelector({
  isDrawing,
  polygonPoints,
  onToggleDrawing,
}: {
  isDrawing: boolean
  polygonPoints: Array<[number, number]>
  onToggleDrawing: () => void
}) {
  const { toogleEndUserFilter } = useGeoContext()
  const onSearch = () => {
    if (polygonPoints.length < 3) return
    toogleEndUserFilter({
      name: 'polygon',
      isActive: true,
      data: {
        polygonPoints: polygonPoints,
      },
    })
  }

  const clearFilter = () => {
    toogleEndUserFilter({
      name: 'polygon',
      isActive: false,
    })
    onToggleDrawing()
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md h-fit">
      <div className="flex flex-col gap-2">
        <label className="font-semibold" htmlFor="company">
          Filtrar por forma
        </label>
        <Button
          onClick={clearFilter}
          variant={isDrawing ? 'destructive' : 'outline'}
        >
          {isDrawing ? 'Cancelar dibujo' : 'Dibujar polígono'}
        </Button>

        {polygonPoints.length >= 3 && (
          <FetchingLinesSpinner>
            <Button onClick={onSearch} className="w-full">
              Buscar líneas
            </Button>
          </FetchingLinesSpinner>
        )}
      </div>
    </div>
  )
}
export default PolygonSelector
