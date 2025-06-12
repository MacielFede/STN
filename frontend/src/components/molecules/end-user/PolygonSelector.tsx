import { Button } from "@/components/ui/button"
import { useGeoContext } from "@/contexts/GeoContext"

function PolygonSelector({
    isDrawing,
    polygonPoints,
    onToggleDrawing
}: {
    isDrawing: boolean
    polygonPoints: [number, number][]
    onToggleDrawing: () => void

}) {
    const { toogleEndUserFilter } = useGeoContext()
    const onSearch = async () => {
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
        <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md w-full h-fit">
            <div className="flex flex-col gap-2">
                <label className="font-semibold" htmlFor="company">
                    Hacete un dibujito dale
                </label>
                <Button
                    onClick={clearFilter}
                    variant={isDrawing ? "destructive" : "outline"}
                >
                    {isDrawing ? 'Cancelar dibujo' : 'Dibujar polígono'}
                </Button>

                {polygonPoints.length >= 3 && (
                    <Button
                        onClick={onSearch}
                        variant="default"
                    >
                        Buscar líneas
                    </Button>
                )}
            </div>
        </div>
    )
} export default PolygonSelector