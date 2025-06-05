// context/BusLineContext.tsx
import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import L, { type LatLngLiteral } from 'leaflet'
import type { BusLineFeature } from '@/models/geoserver'
import { BASIC_LINE_FEATURE } from '@/utils/constants'

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
    updateBusLine: (properties: BusLineFeature) => void;
    switchMode: (mode: 'creation' | 'edition') => void
    cleanUpBusLineStates: () => void
    canSave: boolean
    saveEditedLine: () => void
    busLineStep: BusLineStep | null
    setBusLineStep: React.Dispatch<React.SetStateAction<BusLineStep | null>>
    originStopId: number | null
    setOriginStopId: React.Dispatch<React.SetStateAction<number | null>>
    destinationStopId: number | null
    setDestinationStopId: React.Dispatch<React.SetStateAction<number | null>>
    intermediateStopIds: number[]
    setIntermediateStopIds: React.Dispatch<React.SetStateAction<number[]>>
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
}

const BusLineContext = createContext<BusLineContextType | undefined>(undefined)

export const BusLineProvider = ({ children }: { children: React.ReactNode }) => {
    const [busLineStep, setBusLineStep] = useState<BusLineStep | null>(null);
    const [newBusLine, setNewBusLine] = useState<BusLineFeature | null>(null)
    const [canSave, setCanSave] = useState<boolean>(false)
    const [originStopId, setOriginStopId] = useState<number | null>(null)
    const [destinationStopId, setDestinationStopId] = useState<number | null>(null)
    const [intermediateStopIds, setIntermediateStopIds] = useState<number[]>([])
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
        setBusLineStep(null)
        setNewBusLine(null)
        setCanSave(false)
        featureGroupRef.current = null
        onCreationRef.current = false
        onEditedRef.current = false
        editHandlerRef.current = null
    }, []);

    const updateBusLine = useCallback((feature: BusLineFeature) => {
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
                updateBusLine({
                    ...newBusLine,
                    geometry: {
                        type: 'LineString',
                        coordinates: coords,
                    },
                });
            }
        });

        finishEditingLine();
    }, [newBusLine, updateBusLine, finishEditingLine]);

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
                updateBusLine,
                canSave,
                switchMode,
                saveEditedLine,
                busLineStep,
                setBusLineStep,
                originStopId,
                setOriginStopId,
                destinationStopId,
                setDestinationStopId,
                intermediateStopIds,
                setIntermediateStopIds,
                cleanStopFromAssignments
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
