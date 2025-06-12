import { Drawer } from 'flowbite-react'
import { Button } from '@/components/ui/button'
import { useBusLineContext } from '@/contexts/BusLineContext'
import { createStopLine } from '@/services/busLines'
import { toast } from 'react-toastify'

const StopAssignmentDrawer = ({
    open,
    onClose,
}: {
    open: boolean
    onClose: () => void
}) => {
    const {
        newBusLine,
        busLineStep,
        setBusLineStep,
        originStopId,
        destinationStopId,
        intermediateStopIds,
        setIntermediateStopIds,
        selectedStops,
        cleanUpBusLineStates,
    } = useBusLineContext()

    const getStopStyle = (id: number | null) => {
        if (!id) return "";
        return "bg-blue-50 border border-blue-400 rounded p-2 mt-1";
    }

    const handleSave = async () => {
        if (originStopId === null || destinationStopId === null) {
            toast.error("Por favor, selecciona un origen y un destino antes de guardar.");
            return;
        }
        if (!newBusLine?.properties.number || !newBusLine.properties.id) return;

        const stops = [originStopId, destinationStopId, ...intermediateStopIds];
        if (stops.length < 2) {
            toast.error("Debes seleccionar al menos un origen y un destino.");
            return;
        }

        try {
            await Promise.all(
                stops.map(stopId =>
                    createStopLine(
                        String(stopId),
                        String(newBusLine.properties.id),
                        '10:00:00'
                    )
                )
            );

            toast.success('Asignación de paradas guardada correctamente.');
            onClose();
            cleanUpBusLineStates();
        } catch (error) {
            toast.error('Hubo un error al guardar la asignación de paradas, intenta nuevamente.');
            console.error('Error saving stop assignments:', error);
            cleanUpBusLineStates();
        }
    }

    return (
        <Drawer
            open={open}
            onClose={onClose}
            position="bottom"
            className="z-[5000] bg-white w-full sm:w-[400px] max-w-sm overflow-y-auto"
            backdrop={false}
        >
            <div className="p-4 space-y-4">
                <h2 className="text-xl font-bold text-center">🚌 Asignación de paradas</h2>
                <p className="text-green-700 font-medium text-center">✅ Línea creada correctamente</p>
                <p className="text-sm text-center text-gray-600">
                    Seleccioná las paradas asociadas al recorrido dibujado:
                </p>

                <div className="bg-gray-100 p-3 rounded">
                    <p className="font-semibold">🔘 Paso actual:
                        {busLineStep === "select-origin" ? "Seleccionar origen" :
                            busLineStep === "select-destination" ? "Seleccionar destino" :
                                busLineStep === "select-intermediate" ? "Seleccionar paradas intermedias" :
                                    "Finalizar asignación"}
                    </p>
                </div>

                <div className="space-y-3">
                    <div
                        className={`p-2 rounded ${busLineStep === "select-origin" ? "bg-blue-100 border-l-4 border-blue-500" : ""}`}
                    >
                        <p className={`font-semibold ${busLineStep === "select-origin" ? "text-blue-800" : ""}`}>1. Origen:</p>
                        <Button
                            variant={busLineStep === "select-origin" ? "default" : "outline"}
                            onClick={() => setBusLineStep("select-origin")}
                        >
                            Seleccionar en el mapa
                        </Button>
                        <div className={getStopStyle(originStopId)}>
                            {selectedStops.has(originStopId) ? (
                                <>
                                    <p>{selectedStops.get(originStopId)?.properties.name}</p>
                                    <p className="text-xs text-gray-500">{selectedStops.get(originStopId)?.properties.description}</p>
                                    <p className="text-xs text-gray-500">Refugio: {selectedStops.get(originStopId)?.properties.hasShelter ? "Sí" : "No"}</p>
                                </>
                            ) : (
                                "⬜ No seleccionado"
                            )}
                        </div>
                    </div>

                    <div
                        className={`p-2 rounded ${busLineStep === "select-destination" ? "bg-blue-100 border-l-4 border-blue-500" : ""}`}
                    >
                        <p className={`font-semibold ${busLineStep === "select-destination" ? "text-blue-800" : ""}`}>2. Destino:</p>
                        <Button
                            variant={busLineStep === "select-destination" ? "default" : "outline"}
                            onClick={() => setBusLineStep("select-destination")}
                        >
                            Seleccionar en el mapa
                        </Button>
                        <div className={getStopStyle(destinationStopId)}>
                            {selectedStops.has(destinationStopId) ? (
                                <>
                                    <p>{selectedStops.get(destinationStopId)?.properties.name}</p>
                                    <p className="text-xs text-gray-500">{selectedStops.get(destinationStopId)?.properties.description}</p>
                                    <p className="text-xs text-gray-500">Refugio: {selectedStops.get(destinationStopId)?.properties.hasShelter ? "Sí" : "No"}</p>
                                </>
                            ) : (
                                "⬜ No seleccionado"
                            )}
                        </div>
                    </div>

                    <div
                        className={`p-2 rounded ${busLineStep === "select-intermediate" ? "bg-blue-100 border-l-4 border-blue-500" : ""}`}
                    >
                        <p className={`font-semibold ${busLineStep === "select-intermediate" ? "text-blue-800" : ""}`}>3. Paradas intermedias:</p>
                        <Button
                            variant={busLineStep === "select-intermediate" ? "default" : "outline"}
                            onClick={() => setBusLineStep("select-intermediate")}
                        >
                            + Agregar parada
                        </Button>
                        <ul className="space-y-2 mt-2">
                            {intermediateStopIds.length > 0 ? (
                                intermediateStopIds.map((id) => {
                                    const stop = selectedStops.get(id);
                                    if (!stop) return null;
                                    return (
                                        <li key={id} className="flex flex-col bg-blue-50 p-2 rounded border border-blue-300">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">
                                                    {stop ? stop.properties.name : "Cargando..."}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setIntermediateStopIds(prev => prev.filter(stopId => stopId !== id));
                                                    }}
                                                >
                                                    ❌
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-500">{stop?.properties.description}</p>
                                            <p className="text-xs text-gray-500">Refugio: {stop?.properties.hasShelter ? "Sí" : "No"}</p>
                                        </li>
                                    );
                                })
                            ) : (
                                <li className="text-gray-500 text-sm">No hay paradas intermedias seleccionadas</li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button
                        disabled={
                            originStopId === null ||
                            destinationStopId === null
                        }
                        onClick={handleSave}
                    >Guardar</Button>
                </div>
            </div>
        </Drawer>
    )
}

export default StopAssignmentDrawer
