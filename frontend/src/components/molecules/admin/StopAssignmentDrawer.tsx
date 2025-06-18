import { Drawer } from 'flowbite-react'
import { Button } from '@/components/ui/button'
import { useBusLineContext } from '@/contexts/BusLineContext'
import { createStopLine, isDestinationStopOnStreet, isIntermediateStopOnStreet, isOriginStopOnStreet } from '@/services/busLines'
import { toast } from 'react-toastify'
import { Input } from '@/components/ui/input'
import { useEffect } from 'react'

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

    const addEstimatedTime = (type: 'origin' | 'destination', stopIndex?: number) => {
        if (type === 'origin') {
            setOriginStop(prev => ({
                ...prev,
                estimatedTimes: [...prev.estimatedTimes, '']
            }));
        } else if (type === 'destination') {
            setDestinationStop(prev => ({
                ...prev,
                estimatedTimes: [...prev.estimatedTimes, '']
            }));
        } else if (type === 'intermediate' && stopIndex !== undefined) {
            setIntermediateStops(prev => prev.map((stop, index) =>
                index === stopIndex
                    ? { ...stop, estimatedTimes: [...stop.estimatedTimes, ''] }
                    : stop
            ));
        }
    }

    const removeEstimatedTime = (type: 'origin' | 'destination', timeIndex: number, stopIndex?: number) => {
        if (type === 'origin') {
            setOriginStop(prev => ({
                ...prev,
                estimatedTimes: prev.estimatedTimes.filter((_, index) => index !== timeIndex)
            }));
        } else if (type === 'destination') {
            setDestinationStop(prev => ({
                ...prev,
                estimatedTimes: prev.estimatedTimes.filter((_, index) => index !== timeIndex)
            }));
        } else if (type === 'intermediate' && stopIndex !== undefined) {
            setIntermediateStops(prev => prev.map((stop, index) =>
                index === stopIndex
                    ? { ...stop, estimatedTimes: stop.estimatedTimes.filter((_, timeIdx) => timeIdx !== timeIndex) }
                    : stop
            ));
        }
    }

    const updateEstimatedTime = (type: 'origin' | 'destination', timeIndex: number, value: string, stopIndex?: number) => {
        const timeWithSeconds = value.includes(':') && value.split(':').length === 2
            ? `${value}:00`
            : value;

        if (type === 'origin') {
            setOriginStop(prev => ({
                ...prev,
                estimatedTimes: prev.estimatedTimes.map((time, index) =>
                    index === timeIndex ? timeWithSeconds : time
                )
            }));
        } else if (type === 'destination') {
            setDestinationStop(prev => ({
                ...prev,
                estimatedTimes: prev.estimatedTimes.map((time, index) =>
                    index === timeIndex ? timeWithSeconds : time
                )
            }));
        } else if (type === 'intermediate' && stopIndex !== undefined) {
            setIntermediateStops(prev => prev.map((stop, index) =>
                index === stopIndex
                    ? {
                        ...stop,
                        estimatedTimes: stop.estimatedTimes.map((time, timeIdx) =>
                            timeIdx === timeIndex ? timeWithSeconds : time
                        )
                    }
                    : stop
            ));
        }
    }

    const handleSave = async () => {
        if (originStop === null || destinationStop === null) {
            toast.error("Por favor, selecciona un origen y un destino antes de guardar.");
            return;
        }
        if (!newBusLine?.properties.number || !newBusLine.properties.id) return;

        const stops = [originStop, destinationStop, ...intermediateStops];
        if (stops.length < 2) {
            toast.error("Debes seleccionar al menos un origen y un destino.");
            return;
        }

        if (!originStop.stop || !destinationStop.stop || !intermediateStops) {
            toast.error("Por favor, completa todos los campos antes de guardar.");
            return;
        }

        const originOk = await isOriginStopOnStreet(
            originStop.stop,
            newBusLine
        );

        const destinationOk = await isDestinationStopOnStreet(
            destinationStop.stop,
            newBusLine
        );

        intermediateStops.forEach(async stop => {
            if (!stop.stop) return;
            const intermediateOk = await isIntermediateStopOnStreet(
                stop.stop,
                newBusLine
            );
            if (!intermediateOk) {
                toast.error(`La parada intermedia ${stop.stop.properties.name} no es válida.`);
            }
            return intermediateOk;
        });

        if (!originOk) {
            toast.error("El origen seleccionado no es válido.");
            return;
        }

        if (!destinationOk) {
            toast.error("El destino seleccionado no es válido.");
            return;
        }

        if (intermediateStops.some(stop => !stop.stop)) {
            toast.error("Todas las paradas intermedias deben ser válidas.");
            return;
        }

        if (originStop.estimatedTimes.length !== destinationStop.estimatedTimes.length) {
            toast.error("El número de horarios estimados debe ser el mismo para origen y destino.");
            return;
        }

        try {
            await Promise.all(
                stops.flatMap(stop =>
                    stop.estimatedTimes.map(estimatedTime =>
                        createStopLine(
                            String(stop.stop?.properties.id),
                            String(newBusLine.properties.id),
                            String(estimatedTime)
                        )
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
            position="left"
            className="z-[5000] bg-white w-full sm:w-[400px] max-h-screen max-w-sm overflow-y-auto"
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
                    {/* ORIGIN STOP */}
                    <div
                        className={`p-2 rounded ${busLineStep === "select-origin" ? "bg-blue-100 border-l-4 border-blue-500" : ""}`}
                    >
                        <p className={`font-semibold ${busLineStep === "select-origin" ? "text-blue-800" : ""}`}>Origen:</p>
                        <Button
                            variant={busLineStep === "select-origin" ? "default" : "outline"}
                            onClick={() => setBusLineStep("select-origin")}
                        >
                            Seleccionar en el mapa
                        </Button>
                        <div className={getStopStyle(originStop.stop?.properties?.id)}>
                            {selectedStops.has(originStop.stop?.properties?.id) ? (
                                <>
                                    <p>{selectedStops.get(originStop.stop?.properties?.id)?.properties.name}</p>
                                    <p className="text-xs text-gray-500">{selectedStops.get(originStop.stop?.properties?.id)?.properties.description}</p>
                                    <p className="text-xs text-gray-500">Refugio: {selectedStops.get(originStop.stop?.properties?.id)?.properties.hasShelter ? "Sí" : "No"}</p>

                                    <div className="mt-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-medium">Horarios estimados:</label>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addEstimatedTime('origin')}
                                            >
                                                + Agregar horario
                                            </Button>
                                        </div>
                                        {originStop.estimatedTimes.map((time, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <Input
                                                    type="time"
                                                    value={time ? time.substring(0, 5) : ""}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        updateEstimatedTime('origin', index, e.target.value)
                                                    }
                                                    className="border-black flex-1"
                                                />
                                                {originStop.estimatedTimes.length > 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeEstimatedTime('origin', index)}
                                                    >
                                                        ❌
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        {originStop.estimatedTimes.length === 0 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addEstimatedTime('origin')}
                                            >
                                                Agregar primer horario
                                            </Button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                "⬜ No seleccionado"
                            )}
                        </div>
                    </div>

                    {/* INTERMEDIATE STOPS */}
                    <div
                        className={`p-2 rounded ${busLineStep === "select-intermediate" ? "bg-blue-100 border-l-4 border-blue-500" : ""}`}
                    >
                        <p className={`font-semibold ${busLineStep === "select-intermediate" ? "text-blue-800" : ""}`}>Paradas intermedias:</p>
                        <Button
                            variant={busLineStep === "select-intermediate" ? "default" : "outline"}
                            onClick={() => setBusLineStep("select-intermediate")}
                        >
                            + Agregar parada
                        </Button>
                        <ul className="space-y-2 mt-2">
                            {intermediateStops.length > 0 ? (
                                intermediateStops.map((stop, stopIndex) => {
                                    if (!stop || !stop.stop) return null;
                                    return (
                                        <li key={stopIndex} className="flex flex-col bg-blue-50 p-2 rounded border border-blue-300">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium">
                                                    {selectedStops.get(stop.stop.properties.id)?.properties.name || `Parada ${stop.stop.properties.id}`}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setIntermediateStops(prev => prev.filter((_, index) => index !== stopIndex));
                                                    }}
                                                >
                                                    ❌
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-500">{selectedStops.get(stop.stop.properties.id)?.properties.description}</p>
                                            <p className="text-xs text-gray-500">Refugio: {selectedStops.get(stop.stop.properties.id)?.properties.hasShelter ? "Sí" : "No"}</p>

                                            <div className="mt-2">
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-sm font-medium">Horarios estimados:</label>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addEstimatedTime('intermediate', stopIndex)}
                                                    >
                                                        + Horario
                                                    </Button>
                                                </div>
                                                {stop.estimatedTimes.map((time, timeIndex) => (
                                                    <div key={timeIndex} className="flex gap-2 mb-2">
                                                        <Input
                                                            type="time"
                                                            value={time ? time.substring(0, 5) : ""}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                                updateEstimatedTime('intermediate', timeIndex, e.target.value, stopIndex)
                                                            }
                                                            className="border-black flex-1"
                                                        />
                                                        {stop.estimatedTimes.length > 1 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeEstimatedTime('intermediate', timeIndex, stopIndex)}
                                                            >
                                                                ❌
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                                {stop.estimatedTimes.length === 0 && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addEstimatedTime('intermediate', stopIndex)}
                                                    >
                                                        Agregar primer horario
                                                    </Button>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })
                            ) : (
                                <li className="text-gray-500 text-sm">No hay paradas intermedias seleccionadas</li>
                            )}
                        </ul>
                    </div>

                    {/* DESTINATION STOP */}
                    <div
                        className={`p-2 rounded ${busLineStep === "select-destination" ? "bg-blue-100 border-l-4 border-blue-500" : ""}`}
                    >
                        <p className={`font-semibold ${busLineStep === "select-destination" ? "text-blue-800" : ""}`}>Destino:</p>
                        <Button
                            variant={busLineStep === "select-destination" ? "default" : "outline"}
                            onClick={() => setBusLineStep("select-destination")}
                        >
                            Seleccionar en el mapa
                        </Button>
                        <div className={getStopStyle(destinationStop.stop?.properties?.id)}>
                            {selectedStops.has(destinationStop.stop?.properties?.id) ? (
                                <>
                                    <p>{selectedStops.get(destinationStop.stop?.properties?.id)?.properties.name}</p>
                                    <p className="text-xs text-gray-500">{selectedStops.get(destinationStop.stop?.properties?.id)?.properties.description}</p>
                                    <p className="text-xs text-gray-500">Refugio: {selectedStops.get(destinationStop.stop?.properties?.id)?.properties.hasShelter ? "Sí" : "No"}</p>

                                    <div className="mt-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-medium">Horarios estimados:</label>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addEstimatedTime('destination')}
                                            >
                                                + Agregar horario
                                            </Button>
                                        </div>
                                        {destinationStop.estimatedTimes.map((time, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <Input
                                                    type="time"
                                                    value={time ? time.substring(0, 5) : ""}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        updateEstimatedTime('destination', index, e.target.value)
                                                    }
                                                    className="border-black flex-1"
                                                />
                                                {destinationStop.estimatedTimes.length > 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeEstimatedTime('destination', index)}
                                                    >
                                                        ❌
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        {destinationStop.estimatedTimes.length === 0 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addEstimatedTime('destination')}
                                            >
                                                Agregar primer horario
                                            </Button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                "⬜ No seleccionado"
                            )}
                        </div>
                    </div>

                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button
                        disabled={
                            !originStop.stop ||
                            !destinationStop.stop ||
                            originStop.estimatedTimes?.length === 0 ||
                            originStop.estimatedTimes?.some(time => !time || time.trim() === '' || time === '00:00:00') ||
                            destinationStop.estimatedTimes?.length === 0 ||
                            destinationStop.estimatedTimes?.some(time => !time || time.trim() === '' || time === '00:00:00') ||
                            intermediateStops.some(stop =>
                                !stop.stop ||
                                stop.estimatedTimes?.length === 0 ||
                                stop.estimatedTimes?.some(time => !time || time.trim() === '' || time === '00:00:00')
                            )
                        }
                        onClick={handleSave}
                    >
                        Guardar
                    </Button>
                </div>
            </div>
        </Drawer>
    )
}

export default StopAssignmentDrawer