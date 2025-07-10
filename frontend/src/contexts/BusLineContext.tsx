// context/BusLineContext.tsx
import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import L, { type LatLngLiteral } from 'leaflet'
import type { BusLineFeature, BusStopFeature, LineStringGeometry } from '@/models/geoserver'
import { getHoursAndMinutes } from '@/utils/helpers';
import { useBusLineCreation, type BusLineCreationType } from '@/hooks/useBusLineCreation';
import { lineString, nearestPointOnLine } from '@turf/turf';

type BusLineStep =
    | 'show-crud'
    | 'show-selection-popup'
    | 'creation'
    | 'edition'
    | 'select-origin'
    | 'select-destination'
    | 'select-intermediate';

type BusLineContextType = {
    newBusLine: BusLineFeature | null
    setNewBusLine: React.Dispatch<React.SetStateAction<BusLineFeature | null>>
    handleDeleted: () => void
    featureGroupRef: React.MutableRefObject<L.FeatureGroup | null>
    onCreationRef: React.MutableRefObject<boolean>
    onEditedRef: React.MutableRefObject<boolean>
    editHandlerRef: React.MutableRefObject<L.EditToolbar.Edit | null>
    updateBusLineData: (properties: BusLineFeature) => void;
    switchMode: (mode: 'creation' | 'edition') => void
    cleanUpBusLineStates: () => void
    canSave: boolean
    saveEditedLine: () => void
    busLineStep: BusLineStep | null
    setBusLineStep: React.Dispatch<React.SetStateAction<BusLineStep | null>>
    originStop: { stop: BusStopFeature | null, estimatedTimes: Array<string> }
    setOriginStop: React.Dispatch<React.SetStateAction<{ stop: BusStopFeature | null, estimatedTimes: Array<string> }>>
    destinationStop: { stop: BusStopFeature | null, estimatedTimes: Array<string> }
    setDestinationStop: React.Dispatch<React.SetStateAction<{ stop: BusStopFeature | null, estimatedTimes: Array<string> }>>
    intermediateStops: { stop: BusStopFeature | null, estimatedTimes: Array<string>, status?: boolean }[]
    setIntermediateStops: React.Dispatch<React.SetStateAction<{ stop: BusStopFeature | null, estimatedTimes: Array<string>, status?: boolean }[]>>
    sortIntermediateStopsByGeometry: (
        intermediateStops: Array<{ stop: BusStopFeature, estimatedTimes: string[], status?: boolean }>,
        busLineGeometry: LineStringGeometry
    ) => Array<{ stop: BusStopFeature, estimatedTimes: string[] }>
    cleanStopFromAssignments: (
        stopId: number,
        originId: number | null,
        destinationId: number | null,
        intermediates: number[]
    ) => {
        newOrigin: number | null,
        newDestination: number | null,
        newIntermediates: number[]
    },
    loadBusLineForEdit: (busLine: BusLineFeature) => void
    cacheStop: (stop: BusStopFeature) => void
    cacheStopRemove: (stopId: number) => void
    selectedStops: Map<number | null, BusStopFeature>
    pendingGeometry: any
    setPendingGeometry: React.Dispatch<React.SetStateAction<any>>
    isLoaderActive: boolean
    setIsLoaderActive: React.Dispatch<React.SetStateAction<boolean>>
    showLoader: (timeout?: number) => void
    hideLoader: (timeout?: number) => void
} & BusLineCreationType;

const BusLineContext = createContext<BusLineContextType | undefined>(undefined)

export const BusLineProvider = ({ children }: { children: React.ReactNode }) => {
    const [busLineStep, setBusLineStep] = useState<BusLineStep | null>(null);
    const [newBusLine, setNewBusLine] = useState<BusLineFeature | null>(null)
    const [canSave, setCanSave] = useState<boolean>(false)
    const [originStop, setOriginStop] = useState<{ stop: BusStopFeature | null, estimatedTimes: Array<string> }>({ stop: null, estimatedTimes: [] })
    const [destinationStop, setDestinationStop] = useState<{ stop: BusStopFeature | null, estimatedTimes: Array<string> }>({ stop: null, estimatedTimes: [] })
    const [intermediateStops, setIntermediateStops] = useState<Array<{ stop: BusStopFeature | null, estimatedTimes: Array<string>, status?: boolean }>>([]);
    const [selectedStops, setSelectedStops] = useState<Map<number | null, BusStopFeature>>(new Map());
    const [pendingGeometry, setPendingGeometry] = useState(null)
    const [isLoaderActive, setIsLoaderActive] = useState<boolean>(false);
    const featureGroupRef = useRef<L.FeatureGroup>(null)
    const onCreationRef = useRef<boolean>(false)
    const onEditedRef = useRef<boolean>(false)
    const editHandlerRef = useRef<L.EditToolbar.Edit | null>(null)
    const busLineCreation = useBusLineCreation();

    const finishEditingLine = useCallback(() => {
        if (editHandlerRef.current) {
            editHandlerRef.current.disable()
            onEditedRef.current = false
        }
    }, [])

    const loadBusLineForEdit = useCallback((busLine: BusLineFeature) => {
        busLine.properties.schedule = getHoursAndMinutes(busLine.properties.schedule) + ':00';

        setNewBusLine(busLine)
        switchMode('edition')
        setCanSave(true)

        if (busLine.geometry) {
            setPendingGeometry(busLine.geometry)
        }
    }, [])

    const switchMode = useCallback((mode: 'creation' | 'edition') => {
        if (mode === 'creation') {
            onCreationRef.current = true
            onEditedRef.current = false
            if (editHandlerRef.current) {
                editHandlerRef.current.disable()
            }
        } else if (mode === 'edition') {
            onEditedRef.current = true
            if (editHandlerRef.current) {
                editHandlerRef.current.enable()
            }
        }
    }, []);

    const handleDeleted = useCallback(() => {
        setNewBusLine((prev) => ({
            ...prev,
            geometry: null,
        }))
        busLineCreation.handleReset();
    }, []);

    const cleanUpBusLineStates = useCallback(() => {
        setBusLineStep(null);
        setNewBusLine(null);
        setCanSave(false);

        const group = featureGroupRef.current;
        if (group) {
            const map = group._map;
            if (map) {
                map.removeLayer(group);
            }
            group.clearLayers();
        }

        if (editHandlerRef.current) {
            editHandlerRef.current.disable();
        }

        onCreationRef.current = false;
        onEditedRef.current = false;
        featureGroupRef.current = null;
        editHandlerRef.current = null;
        setOriginStop({ stop: null, estimatedTimes: [] });
        setDestinationStop({ stop: null, estimatedTimes: [] });
        setIntermediateStops([]);
        setSelectedStops(new Map());
        setPendingGeometry(null);
        busLineCreation.handleReset();
    }, []);

    const updateBusLineData = useCallback((feature: BusLineFeature) => {
        const propertiesCompleted = Object.values(feature.properties).every(
            (value) => value !== null && value !== undefined && value !== ''
        )
        const geometryCompleted = feature.geometry && feature.geometry.coordinates.length > 0
        const allCompleted = propertiesCompleted && geometryCompleted
        setNewBusLine(feature)
        setCanSave(allCompleted)
    }, [])

    const saveEditedLine = useCallback(() => {
        const layers = featureGroupRef.current?.getLayers();
        if (!layers) return;

        layers.forEach((layer: any) => {
            if (layer instanceof L.Polyline) {
                const latlngs: any = layer.getLatLngs() as LatLngLiteral[];
                const coords = latlngs.map((latlng: { lng: any; lat: any }) => [latlng.lng, latlng.lat]);

                if (!newBusLine?.properties) return;
                updateBusLineData({
                    ...newBusLine,
                    geometry: {
                        type: 'LineString',
                        coordinates: coords,
                    },
                });
            }
        });

        finishEditingLine();
    }, [newBusLine, updateBusLineData, finishEditingLine]);

    const sortIntermediateStopsByGeometry = (
        intermediateStops: Array<{ stop: BusStopFeature, estimatedTimes: string[], status?: boolean }>,
        busLineGeometry: LineStringGeometry
    ) => {
        if (!busLineGeometry?.coordinates?.length) return intermediateStops;
        const busLine = lineString(busLineGeometry.coordinates);

        return [...intermediateStops].sort((a, b) => {
            const aCoord = a.stop?.geometry?.coordinates;
            const bCoord = b.stop?.geometry?.coordinates;
            if (!aCoord || !bCoord) return 0;

            const aSnap = nearestPointOnLine(busLine, aCoord);
            const bSnap = nearestPointOnLine(busLine, bCoord);

            return aSnap.properties.location - bSnap.properties.location;
        });
    };

    const cleanStopFromAssignments = (
        stopId: number,
        originId: number | null,
        destinationId: number | null,
        intermediates: (number | null)[]
    ) => {
        let newOrigin = originId === stopId ? null : originId;
        let newDestination = destinationId === stopId ? null : destinationId;
        let newIntermediates = intermediates.filter(id => id !== null && id !== stopId);

        return { newOrigin, newDestination, newIntermediates };
    };

    const cacheStop = (stop: BusStopFeature) => {
        const stopId = stop.properties.id;
        if (typeof stopId !== 'number') return;
        setSelectedStops(prev => new Map(prev).set(stopId, stop));
    };

    const cacheStopRemove = (stopId: number) => {
        setSelectedStops(prev => {
            if (!prev.has(stopId)) return prev;
            const newMap = new Map(prev);
            newMap.delete(stopId);
            return newMap;
        });
    };

    const showLoader = useCallback((timeout: number = null) => {
        if (timeout) {
            setTimeout(() => {
                setIsLoaderActive(true);
            }, timeout);
            return;
        }
        setIsLoaderActive(true);
    }, []);

    const hideLoader = useCallback((timeout: number = null) => {
        if (timeout) {
            setTimeout(() => {
                setIsLoaderActive(false);
            }, timeout);
            return;
        }
        setIsLoaderActive(false);
    }, []);

    return (
        <BusLineContext.Provider
            value={{
                newBusLine,
                setNewBusLine,
                handleDeleted,
                featureGroupRef,
                onCreationRef,
                onEditedRef,
                editHandlerRef,
                cleanUpBusLineStates,
                updateBusLineData,
                canSave,
                switchMode,
                saveEditedLine,
                busLineStep,
                setBusLineStep,
                originStop,
                setOriginStop,
                destinationStop,
                setDestinationStop,
                intermediateStops,
                setIntermediateStops,
                cleanStopFromAssignments,
                sortIntermediateStopsByGeometry,
                loadBusLineForEdit,
                cacheStop,
                cacheStopRemove,
                selectedStops,
                pendingGeometry,
                setPendingGeometry,
                showLoader,
                hideLoader,
                isLoaderActive,
                ...busLineCreation,
            }}
        >
            {children}
        </BusLineContext.Provider>
    )
}

export const useBusLineContext = (): BusLineContextType => {
    const context = useContext(BusLineContext)
    if (!context) {
        throw new Error('useBusLineContext must be used within a BusLineProvider')
    }
    return context
}
