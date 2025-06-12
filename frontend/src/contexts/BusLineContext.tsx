// context/BusLineContext.tsx
import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import L, { type LatLngLiteral } from 'leaflet'
import type { BusLineFeature, BusStopFeature } from '@/models/geoserver'

type BusLineStep =
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
    originStop: { id: number | null, estimatedTime: string | null }
    setOriginStop: React.Dispatch<React.SetStateAction<{ id: number | null, estimatedTime: string | null }>>
    destinationStop: { id: number | null, estimatedTime: string | null }
    setDestinationStop: React.Dispatch<React.SetStateAction<{ id: number | null, estimatedTime: string | null }>>
    intermediateStops: { id: number | null, estimatedTime: string | null }[]
    setIntermediateStops: React.Dispatch<React.SetStateAction<{ id: number | null, estimatedTime: string | null }[]>>
    cleanStopFromAssignments: (
        stopId: number,
        originId: number | null,
        destinationId: number | null,
        intermediates: number[]
    ) => {
        newOrigin: number | null,
        newDestination: number | null,
        newIntermediates: number[]
    }
    cacheStop: (stop: BusStopFeature) => void
    selectedStops: Map<number | null, BusStopFeature>
}

const BusLineContext = createContext<BusLineContextType | undefined>(undefined)

export const BusLineProvider = ({ children }: { children: React.ReactNode }) => {
    const [busLineStep, setBusLineStep] = useState<BusLineStep | null>(null);
    const [newBusLine, setNewBusLine] = useState<BusLineFeature | null>(null)
    const [canSave, setCanSave] = useState<boolean>(false)
    const [originStop, setOriginStop] = useState<{ id: number | null, estimatedTime: string | null }>({ id: null, estimatedTime: null })
    const [destinationStop, setDestinationStop] = useState<{ id: number | null, estimatedTime: string | null }>({ id: null, estimatedTime: null })
    const [intermediateStops, setIntermediateStops] = useState<{ id: number | null, estimatedTime: string | null }[]>([]);
    const [selectedStops, setSelectedStops] = useState<Map<number | null, BusStopFeature>>(new Map());
    const featureGroupRef = useRef<L.FeatureGroup>(null)
    const onCreationRef = useRef<boolean>(false)
    const onEditedRef = useRef<boolean>(false)
    const editHandlerRef = useRef<L.EditToolbar.Edit | null>(null)

    const finishEditingLine = useCallback(() => {
        if (editHandlerRef.current) {
            editHandlerRef.current.disable()
            onEditedRef.current = false
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
        cleanUpBusLineStates();
    }, []);

    const cleanUpBusLineStates = useCallback(() => {
        debugger;
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
        setOriginStop({ id: null, estimatedTime: null });
        setDestinationStop({ id: null, estimatedTime: null });
        setIntermediateStops([]);
        setSelectedStops(new Map());
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

    const cleanStopFromAssignments = (
        stopId: number,
        originId: number | null,
        destinationId: number | null,
        intermediates: number[]
    ) => {
        let newOrigin = originId === stopId ? null : originId;
        let newDestination = destinationId === stopId ? null : destinationId;
        let newIntermediates = intermediates.filter(id => id !== stopId);

        return { newOrigin, newDestination, newIntermediates };
    };

    const cacheStop = (stop: BusStopFeature) => {
        const stopId = stop.properties.id;
        if (typeof stopId !== 'number') return;
        setSelectedStops(prev => new Map(prev).set(stopId, stop));
    };

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
                cacheStop,
                selectedStops
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
