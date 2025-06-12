import { Drawer } from 'flowbite-react'
import { Button } from '@/components/ui/button'
import { useBusLineContext } from '@/contexts/BusLineContext'
import { createStopLine } from '@/services/busLines'
import { toast } from 'react-toastify'
import { Input } from '@/components/ui/input'

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
        originStop,
        destinationStop,
        intermediateStops,
        selectedStops,
        cleanUpBusLineStates,
        setOriginStop,
        setDestinationStop,
        setIntermediateStops,
    } = useBusLineContext()

    const getStopStyle = (id: number | null) => {
        if (!id) return "";
        return "bg-blue-50 border border-blue-400 rounded p-2 mt-1";
    }

    const handleSave = async () => {
        if (originStop.id === null || destinationStop.id === null) {
            toast.error("Por favor, selecciona un origen y un destino antes de guardar.");
            return;
        }
        if (!newBusLine?.properties.number || !newBusLine.properties.id) return;

        const stops = [originStop, destinationStop, ...intermediateStops];
        if (stops.length < 2) {
            toast.error("Debes seleccionar al menos un origen y un destino.");
            return;
        }

        try {
            await Promise.all(
                stops.map(stop =>
                    createStopLine(
                        String(stop.id),
                        String(newBusLine.properties.id),
                        String(stop.estimatedTime)
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
                        <div className={getStopStyle(originStop.id)}>
                            {selectedStops.has(originStop.id) ? (
                                <>
                                    <p>{selectedStops.get(originStop.id)?.properties.name}</p>
                                    <p className="text-xs text-gray-500">{selectedStops.get(originStop.id)?.properties.description}</p>
                                    <p className="text-xs text-gray-500">Refugio: {selectedStops.get(originStop.id)?.properties.hasShelter ? "Sí" : "No"}</p>
                                    <Input
                                        type="time"
                                        value={originStop.estimatedTime ?? ""}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const timeValue = e.target.value;
                                            const timeWithSeconds = timeValue.includes(':') && timeValue.split(':').length === 2
                                                ? `${timeValue}:00`
                                                : timeValue;

                                            setOriginStop(prev => ({
                                                ...prev,
                                                estimatedTime: timeWithSeconds
                                            }));
                                        }}
                                        className="border-black"
                                    />
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
                        <div className={getStopStyle(destinationStop.id)}>
                            {selectedStops.has(destinationStop.id) ? (
                                <>
                                    <p>{selectedStops.get(destinationStop.id)?.properties.name}</p>
                                    <p className="text-xs text-gray-500">{selectedStops.get(destinationStop.id)?.properties.description}</p>
                                    <p className="text-xs text-gray-500">Refugio: {selectedStops.get(destinationStop.id)?.properties.hasShelter ? "Sí" : "No"}</p>
                                    <Input
                                        type="time"
                                        value={destinationStop.estimatedTime ?? ""}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const timeValue = e.target.value;
                                            const timeWithSeconds = timeValue.includes(':') && timeValue.split(':').length === 2
                                                ? `${timeValue}:00`
                                                : timeValue;

                                            setDestinationStop(prev => ({
                                                ...prev,
                                                estimatedTime: timeWithSeconds
                                            }));
                                        }}
                                        className="border-black"
                                    />
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
                            {intermediateStops.length > 0 ? (
                                intermediateStops.map((stop) => {
                                    if (!stop) return null;
                                    return (
                                        <li key={stop.id} className="flex flex-col bg-blue-50 p-2 rounded border border-blue-300">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">
                                                    {selectedStops.get(stop.id)?.properties.name || `Parada ${stop.id}`}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setIntermediateStops(prev => prev.filter(intermediate => intermediate.id !== stop.id));
                                                    }}
                                                >
                                                    ❌
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-500">{selectedStops.get(stop.id)?.properties.description}</p>
                                            <p className="text-xs text-gray-500">Refugio: {selectedStops.get(stop.id)?.properties.hasShelter ? "Sí" : "No"}</p>
                                            <Input
                                                type="time"
                                                value={stop.estimatedTime ?? ""}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const timeValue = e.target.value;
                                                    const timeWithSeconds = timeValue.includes(':') && timeValue.split(':').length === 2
                                                        ? `${timeValue}:00`
                                                        : timeValue;

                                                    setIntermediateStops(prev => prev.map(intermediate =>
                                                        intermediate.id === stop.id
                                                            ? { ...intermediate, estimatedTime: timeWithSeconds }
                                                            : intermediate
                                                    ));
                                                }}
                                                className="border-black mt-1"
                                            />
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
                            originStop.id === null ||
                            destinationStop.id === null ||
                            originStop.estimatedTime === null ||
                            destinationStop.estimatedTime === null
                        }
                        onClick={handleSave}
                    >Guardar</Button>
                </div>
            </div>
        </Drawer>
    )
}

export default StopAssignmentDrawer
