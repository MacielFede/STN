// context/BusLineContext.tsx
import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import L, { type LatLngLiteral } from 'leaflet'
import type { BusLineFeature } from '@/models/geoserver'
import { BASIC_LINE_FEATURE } from '@/utils/constants'

type BusLineContextType = {
    newBusLine: BusLineFeature | null
    setNewBusLine: React.Dispatch<React.SetStateAction<BusLineFeature | null>>
    handleDeleted: () => void
    featureGroupRef: React.MutableRefObject<L.FeatureGroup | null>
    onCreationRef: React.MutableRefObject<boolean>
    onEditedRef: React.MutableRefObject<boolean>
    editHandlerRef: React.MutableRefObject<L.EditToolbar.Edit | null>
    updateBusLine: (properties: BusLineFeature) => void;
    cleanUp: () => void
    canSave: boolean
    saveEditedLine: () => void
}

const BusLineContext = createContext<BusLineContextType | undefined>(undefined)

export const BusLineProvider = ({ children }: { children: React.ReactNode }) => {
    const [newBusLine, setNewBusLine] = useState<BusLineFeature | null>(null)
    const [canSave, setCanSave] = useState<boolean>(false)
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

    const handleDeleted = useCallback(() => {
        cleanUp();
    }, []);

    const cleanUp = useCallback(() => {
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
        debugger;
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
                cleanUp,
                updateBusLine,
                canSave,
                saveEditedLine
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
