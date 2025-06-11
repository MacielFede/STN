import { Button } from "@/components/ui/button"

function PolygonSelector({
    isDrawing,
    polygonPoints,
    onToggleDrawing,
    onSearch
}: {
    isDrawing: boolean
    polygonPoints: [number, number][]
    onToggleDrawing: () => void
    onSearch: () => void
}) {
    return (
        <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md w-full h-fit">
            <div className="flex flex-col gap-2">
                <label className="font-semibold" htmlFor="company">
                    Hacete un dibujito dale
                </label>
                <Button
                    onClick={onToggleDrawing}
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