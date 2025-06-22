import type { LineStringGeometry } from '@/models/geoserver';
import { _getStops } from '@/services/busStops';
import { DISTANCE_BETWEEN_STOPS_AND_STREET } from '@/utils/constants';
import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

export type CreatorMode = 'idle' | 'drawing' | 'editing' | 'finished';

export type BusLineCreationType = {
    points: [number, number][];
    setPoints: React.Dispatch<React.SetStateAction<[number, number][]>>;
    calculatedRoute: LineStringGeometry | null;
    setCalculatedRoute: React.Dispatch<React.SetStateAction<LineStringGeometry | null>>;
    hoveredIdx: number | null;
    setHoveredIdx: React.Dispatch<React.SetStateAction<number | null>>;
    mousePos: [number, number] | null;
    setMousePos: React.Dispatch<React.SetStateAction<[number, number] | null>>;
    addPoint: (lng: number, lat: number) => void;
    handleReset: () => void;
    MAX_POINTS: number;
    handleFinished: () => Promise<void>;
    handleDeletePoint: (idx: number) => void;
    mode: CreatorMode;
    setMode: React.Dispatch<React.SetStateAction<CreatorMode>>;
    updatePointsFromDraw: (latlngs: Array<{ lat: number; lng: number }>) => void;
    polylineRef: React.MutableRefObject<L.Polyline | null>;
    featureGroupRef: React.MutableRefObject<L.FeatureGroup | null>;
    drawControlRef: React.MutableRefObject<L.Control.Draw | null>;
};

const MAX_POINTS = 10;

export function useBusLineCreation(): BusLineCreationType {
    const [points, setPoints] = useState<[number, number][]>([]);
    const [calculatedRoute, setCalculatedRoute] = useState<LineStringGeometry | null>(null);
    const [mousePos, setMousePos] = useState<[number, number] | null>(null);
    const [deleteClicks, setDeleteClicks] = useState<{ [idx: number]: number }>({});
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const [mode, setMode] = useState<CreatorMode>('idle');
    const polylineRef = useRef<L.Polyline | null>(null);
    const featureGroupRef = useRef<L.FeatureGroup>(null);
    const drawControlRef = useRef<L.Control.Draw | null>(null);

    // Add point and switch to drawing mode if needed
    const addPoint = useCallback((lng: number, lat: number) => {
        setPoints(prev => {
            if (prev.length < MAX_POINTS) {
                if (mode === 'idle') setMode('drawing');
                return [...prev, [lng, lat]];
            }
            return prev;
        });
    }, [mode]);

    const handleDeletePoint = useCallback((idx: number) => {
        setDeleteClicks(prev => {
            const clicks = (prev[idx] || 0) + 1;
            if (clicks >= 2) {
                setPoints(points => points.filter((_, i) => i !== idx));
                setMode('drawing');
                const newClicks = { ...prev };
                delete newClicks[idx];
                return newClicks;
            }
            return { ...prev, [idx]: clicks };
        });
        setTimeout(() => {
            setDeleteClicks(prev => {
                if (prev[idx] === 1) {
                    const newClicks = { ...prev };
                    delete newClicks[idx];
                    return newClicks;
                }
                return prev;
            });
        }, 1500);
    }, []);

    const handleReset = useCallback(() => {
        setPoints([]);
        setCalculatedRoute(null);
        setDeleteClicks({});
        setMousePos(null);
        setHoveredIdx(null);
        setMode('idle');
        if (polylineRef.current) {
            polylineRef.current.remove();
            polylineRef.current = null;
        }
        if (featureGroupRef.current) {
            featureGroupRef.current.clearLayers();
        }
        if (drawControlRef.current) {
            drawControlRef.current = null;
        }
    }, []);

    const handleFinished = useCallback(async () => {
        const origin = points[0];
        const destination = points[points.length - 1];

        const cqlFilter = `DWITHIN(geometry, POINT(${origin[1]} ${origin[0]}), ${DISTANCE_BETWEEN_STOPS_AND_STREET}, meters)`;
        const originData = await _getStops(cqlFilter);
        if (!originData || originData.length === 0) {
            toast.error('Por favor, asegúrate de que el origen de la línea sea una parada válida.');
            setMode('drawing');
            throw new Error('No valid origin stop found.');
        }
        const cqlFilterDest = `DWITHIN(geometry, POINT(${destination[1]} ${destination[0]}), ${DISTANCE_BETWEEN_STOPS_AND_STREET}, meters)`;
        const destinationData = await _getStops(cqlFilterDest);
        if (!destinationData || destinationData.length === 0) {
            toast.error('Por favor, asegúrate de que el destino de la línea sea una parada válida.');
            setMode('drawing');
            throw new Error('No valid destination stop found.');
        }
    }, [points]);

    const updatePointsFromDraw = useCallback((latlngs: Array<{ lat: number; lng: number }>) => {
        setPoints(latlngs.map(({ lng, lat }) => [lng, lat]));
    }, []);

    return {
        points,
        setPoints,
        calculatedRoute,
        setCalculatedRoute,
        mousePos,
        setMousePos,
        addPoint,
        handleReset,
        handleFinished,
        handleDeletePoint,
        MAX_POINTS,
        hoveredIdx,
        setHoveredIdx,
        mode,
        setMode,
        updatePointsFromDraw,
        polylineRef,
        featureGroupRef,
        drawControlRef,
    };
}