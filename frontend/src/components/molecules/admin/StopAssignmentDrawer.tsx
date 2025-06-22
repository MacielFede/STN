import { Drawer } from 'flowbite-react'
import { Button } from '@/components/ui/button'
import { useBusLineContext } from '@/contexts/BusLineContext'
import { createBusLine, createStopLine, deleteStopLine, getByStop, getStopLineByBusLineId, isDestinationStopOnStreet, isIntermediateStopOnStreet, isOriginStopOnStreet, updateBusLine, updateStopLine } from '@/services/busLines'
import { toast } from 'react-toastify'
import { Input } from '@/components/ui/input'
import { useEffect } from 'react'
import { _getStops, getStopGeoServer, updateStop } from '@/services/busStops'
import { DISTANCE_BETWEEN_STOPS_AND_STREET } from '@/utils/constants'

const StopAssignmentDrawer = ({
    open,
    onClose,
}: {
    open: boolean
    onClose: () => void
}) => {
    const {
        points,
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
        cacheStop,
        updateBusLineData,
    } = useBusLineContext()

    const getStopStyle = (id: number | null) => {
        if (!id) return "";
        return "bg-blue-50 border border-blue-400 rounded p-2 mt-1";
    }

    const timeToSeconds = (t: string) => {
        const [h, m, s] = t.split(':').map(Number);
        return h * 3600 + m * 60 + (s || 0);
    };

    const areTimesStrictlyIncreasing = (times: string[]) => {
        for (let i = 1; i < times.length; i++) {
            if (timeToSeconds(times[i - 1]) >= timeToSeconds(times[i])) {
                return false;
            }
        }
        return true;
    };

    const areStopTimesOrdered = () => {
        const allStops = [originStop, ...intermediateStops, destinationStop];

        const timesLength = originStop.estimatedTimes.length;
        if (
            timesLength === 0 ||
            allStops.some(stop => stop.estimatedTimes.length !== timesLength) ||
            allStops.some(stop => stop.estimatedTimes.some(time => !time || time.trim() === ''))
        ) {
            return false;
        }

        for (let i = 0; i < timesLength; i++) {
            let prev = timeToSeconds(allStops[0].estimatedTimes[i]);
            for (let j = 1; j < allStops.length; j++) {
                const curr = timeToSeconds(allStops[j].estimatedTimes[i]);
                if (prev >= curr) return false;
                prev = curr;
            }
        }
        return true;
    };

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
        if (!newBusLine?.geometry?.coordinates?.length) return;

        const stops = [originStop, destinationStop, ...intermediateStops];
        if (stops.length < 2) {
            toast.error("Debes seleccionar al menos un origen y un destino.");
            return;
        }

        if (!originStop.stop || !destinationStop.stop || !intermediateStops) {
            toast.error("Por favor, completa todos los campos antes de guardar.");
            return;
        }

        const originOk = await isOriginStopOnStreet(originStop.stop, newBusLine);
        const destinationOk = await isDestinationStopOnStreet(destinationStop.stop, newBusLine);

        for (const stop of intermediateStops) {
            if (!stop.stop) continue;
            const intermediateOk = await isIntermediateStopOnStreet(stop.stop, newBusLine);
            if (!intermediateOk) {
                toast.error(`La parada intermedia ${stop.stop.properties.name} no es válida.`);
                return;
            }
        }

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

        if (!newBusLine.properties.id) {
            try {
                const response = await createBusLine({
                    geometry: newBusLine.geometry,
                    properties: { ...newBusLine.properties },
                });
                if (!response || !response.data || !response.data.id) {
                    toast.error("Error al crear la línea de bus, intenta nuevamente.");
                    return;
                }
                updateBusLineData({
                    ...newBusLine,
                    properties: {
                        ...newBusLine.properties,
                        id: response.data.id,
                    },
                });
                newBusLine.properties.id = response.data.id;
            } catch (error) {
                toast.error("Error al crear la línea de bus, intenta nuevamente.");
                console.error("Error creating bus line:", error);
                return;
            }
        }
        else {
            debugger;
            const response = await updateBusLine({
                geometry: newBusLine.geometry,
                properties: { ...newBusLine.properties },
            });
            if (!response || !response.data || !response.data.id) {
                toast.error("Error al actualizar la línea de bus, intenta nuevamente.");
                return;
            }
            updateBusLineData({
                ...newBusLine,
                properties: {
                    ...newBusLine.properties,
                    id: response.data.id,
                },
            });
        }

        try {
            const associations = await getStopLineByBusLineId(String(newBusLine.properties.id));
            const associationMap = new Map<string, any>();
            associations.forEach(assoc => {
                associationMap.set(`${assoc.stopId}_${assoc.estimatedTime}`, assoc);
            });

            const newAssignments = stops.flatMap(stop =>
                stop.estimatedTimes.map(estimatedTime => ({
                    stopId: String(stop.stop?.properties.id),
                    busLineId: String(newBusLine.properties.id),
                    estimatedTime: String(estimatedTime),
                }))
            );
            const newAssignmentKeys = new Set(
                newAssignments.map(a => `${a.stopId}_${a.estimatedTime}`)
            );

            const upsertRequests = newAssignments.map(async assignment => {
                const key = `${assignment.stopId}_${assignment.estimatedTime}`;
                if (associationMap.has(key)) {
                    const assoc = associationMap.get(key);
                    return updateStopLine(
                        String(assoc.id),
                        assignment.stopId,
                        assignment.busLineId,
                        assignment.estimatedTime
                    );
                } else {
                    return createStopLine(assignment.stopId, assignment.busLineId, assignment.estimatedTime);
                }
            });

            const toDeleteAssociations = associations.filter(assoc => {
                return !newAssignmentKeys.has(`${assoc.stopId}_${assoc.estimatedTime}`);
            });

            const deleteRequests = toDeleteAssociations.map(assoc => deleteStopLine(String(assoc.id)));

            await Promise.all([...upsertRequests, ...deleteRequests]);

            let someOrphaned = false;
            for (const association of toDeleteAssociations) {
                const isOrphaned = await getByStop(String(association.stopId));
                if (isOrphaned.length === 0) {
                    const stop = await _getStops(`id = ${association.stopId}`);
                    if (!stop || stop.length === 0) continue;
                    stop[0].properties.status = 'INACTIVE';
                    someOrphaned = true;
                    await updateStop({
                        ...stop[0].properties,
                        geometry: stop[0].geometry,
                    });
                }
            }

            if (someOrphaned) {
                toast.warning("Algunas paradas quedaron huérfanas", {
                    autoClose: 8000,
                });
            }

            toast.success('Linea creada correctamente');
            onClose();
            cleanUpBusLineStates();
        } catch (error) {
            toast.error('Hubo un error al guardar la asignación de paradas, intenta nuevamente.');
            console.error('Error saving stop assignments:', error);
            cleanUpBusLineStates();
        }
    }

    useEffect(() => {
        if (!open || !newBusLine) return;

        const verifyPossibleOrphanStops = async () => {
            const stops = [originStop, destinationStop, ...intermediateStops];
            const associations = await getStopLineByBusLineId(String(newBusLine.properties.id));
            const associationMap = new Map<string, any>();
            associations.forEach(assoc => {
                associationMap.set(`${assoc.stopId}_${assoc.estimatedTime}`, assoc);
            });

            const newAssignments = stops.flatMap(stop =>
                stop.estimatedTimes.map(estimatedTime => ({
                    stopId: String(stop.stop?.properties.id),
                    busLineId: String(newBusLine.properties.id),
                    estimatedTime: String(estimatedTime),
                }))
            );
            const newAssignmentKeys = new Set(
                newAssignments.map(a => `${a.stopId}_${a.estimatedTime}`)
            );

            const toDeleteAssociations = associations.filter(assoc => {
                return !newAssignmentKeys.has(`${assoc.stopId}_${assoc.estimatedTime}`);
            });

            if (toDeleteAssociations.length === 0) return;

            // toast.warning(`Se desasociará/n ${toDeleteAssociations.length} parada/s no asociada/s a ninguna línea.`, {
            //     autoClose: 8000,
            // });
        };

        const fetchAssociations = async () => {
            const busStopsForLine = await getStopLineByBusLineId(String(newBusLine?.properties.id));
            if (!busStopsForLine || busStopsForLine.length === 0) return;

            const stopsArray = await Promise.all(
                busStopsForLine.map(async association => {
                    const geoStop = await getStopGeoServer(Number(association.stopId));
                    return [Number(association.stopId), geoStop] as [number, any];
                })
            );
            const stopsFromGeoServer = new Map<number, any>(stopsArray);

            let newOrigin = null;
            let newDestination = null;
            let newIntermediates: Array<{ stop: any, estimatedTimes: string[] }> = [];

            for (const [id, stop] of stopsFromGeoServer.entries()) {
                const estimatedTimes = busStopsForLine
                    .filter(assoc => Number(assoc.stopId) === id)
                    .map(assoc => assoc.estimatedTime)
                    .sort();

                if (await isOriginStopOnStreet(stop, newBusLine)) {
                    newOrigin = { stop, estimatedTimes };
                    cacheStop(stop);
                } else if (await isDestinationStopOnStreet(stop, newBusLine)) {
                    newDestination = { stop, estimatedTimes };
                    cacheStop(stop);
                } else if (await isIntermediateStopOnStreet(stop, newBusLine)) {
                    newIntermediates.push({ stop, estimatedTimes });
                    cacheStop(stop);
                }
            }

            if (newBusLine?.geometry && Array.isArray(newBusLine.geometry.coordinates)) {
                const geometryCoords = newBusLine.geometry.coordinates.map(
                    ([lng, lat]) => `${lng},${lat}`
                );

                newIntermediates.sort((a, b) => {
                    const aCoord = a.stop.geometry?.coordinates;
                    const bCoord = b.stop.geometry?.coordinates;
                    const aIndex = geometryCoords.indexOf(aCoord ? `${aCoord[0]},${aCoord[1]}` : "");
                    const bIndex = geometryCoords.indexOf(bCoord ? `${bCoord[0]},${bCoord[1]}` : "");
                    return aIndex - bIndex;
                });
            }

            if (newOrigin) setOriginStop(newOrigin);
            if (newDestination) setDestinationStop(newDestination);
            setIntermediateStops(newIntermediates);
        };

        const fetchPointsFromCreation = async () => {
            const origin = points[0];
            const destination = points[points.length - 1];
            if (!origin || !destination) return;

            const cqlFilter = `DWITHIN(geometry, POINT(${origin[1]} ${origin[0]}), ${DISTANCE_BETWEEN_STOPS_AND_STREET}, meters)`;
            const originData = await _getStops(cqlFilter);
            if (!originData || originData.length === 0) {
                toast.error("No se encontró una parada de origen cerca del punto inicial.");
                return;
            }
            const destinationCqlFilter = `DWITHIN(geometry, POINT(${destination[1]} ${destination[0]}), ${DISTANCE_BETWEEN_STOPS_AND_STREET}, meters)`;
            const destinationData = await _getStops(destinationCqlFilter);
            if (!destinationData || destinationData.length === 0) {
                toast.error("No se encontró una parada de destino cerca del punto final.");
                return;
            }
            cacheStop(originData[0]);
            cacheStop(destinationData[0]);
            setOriginStop({
                stop: originData[0],
                estimatedTimes: [],
            });
            setDestinationStop({
                stop: destinationData[0],
                estimatedTimes: [],
            });
        }

        // If bus line is in edit mode
        if (newBusLine?.properties?.id) {
            verifyPossibleOrphanStops();
            fetchAssociations();
        }
        else {
            fetchPointsFromCreation();
        }

    }, [open, newBusLine]);

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
                            destinationStop.estimatedTimes?.length === 0 ||
                            intermediateStops.some(stop =>
                                !stop.stop ||
                                stop.estimatedTimes?.length === 0
                            ) ||
                            !areStopTimesOrdered()
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
