import { _getStops } from '@/services/busStops';
import { DISTANCE_BETWEEN_STOPS_AND_STREET } from '@/utils/constants';
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export type BusLineCreationType = {
    points: [number, number][];
    setPoints: React.Dispatch<React.SetStateAction<[number, number][]>>;
    hoveredIdx: number | null;
    setHoveredIdx: React.Dispatch<React.SetStateAction<number | null>>;
    finished: boolean;
    setFinished: React.Dispatch<React.SetStateAction<boolean>>;
    mousePos: [number, number] | null;
    setMousePos: React.Dispatch<React.SetStateAction<[number, number] | null>>;
    addPoint: (lng: number, lat: number) => void;
    handleReset: () => void;
    MAX_POINTS: number;
    handleFinished: () => Promise<void>;
    handleDeletePoint: (idx: number) => void;
};

const MAX_POINTS = 10;

export function useBusLineCreation() {
    const [points, setPoints] = useState<[number, number][]>([]);
    const [finished, setFinished] = useState(false);
    const [mousePos, setMousePos] = useState<[number, number] | null>(null);
    const [deleteClicks, setDeleteClicks] = useState<{ [idx: number]: number }>({});
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)


    const addPoint = useCallback((lng: number, lat: number) => {
        if (points.length >= MAX_POINTS) return;
        setPoints(prev => (prev.length < MAX_POINTS ? [...prev, [lng, lat]] : prev));
    }, [finished, points, mousePos]);

    const handleDeletePoint = useCallback((idx: number) => {
        setDeleteClicks(prev => {
            const clicks = (prev[idx] || 0) + 1
            if (clicks >= 2) {
                setPoints(points => points.filter((_, i) => i !== idx))
                setFinished(false)
                const newClicks = { ...prev }
                delete newClicks[idx]
                return newClicks
            }
            return { ...prev, [idx]: clicks }
        })
        setTimeout(() => {
            setDeleteClicks(prev => {
                if (prev[idx] === 1) {
                    const newClicks = { ...prev }
                    delete newClicks[idx]
                    return newClicks
                }
                return prev
            })
        }, 1500)
    }, [points]);

    function distance(a: [number, number], b: [number, number]) {
        return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
    }

    const handleReset = useCallback(() => {
        setPoints([]);
        setFinished(false);
        setDeleteClicks({});
        setMousePos(null);
        setHoveredIdx(null);
    }, []);

    const handleFinished = useCallback(async () => {
        const origin = points[0];
        const destination = points[points.length - 1];

        const cqlFilter = `DWITHIN(geometry, POINT(${origin[1]} ${origin[0]}), ${DISTANCE_BETWEEN_STOPS_AND_STREET}, meters)`;
        const originData = await _getStops(cqlFilter);
        if (!originData || originData.length === 0) {
            toast.error('Por favor, asegúrate de que el origen de la línea sea una parada válida.');
            setFinished(false);
            throw new Error('No valid origin stop found.');
        }
        const cqlFilterDest = `DWITHIN(geometry, POINT(${destination[1]} ${destination[0]}), ${DISTANCE_BETWEEN_STOPS_AND_STREET}, meters)`;
        const destinationData = await _getStops(cqlFilterDest);
        if (!destinationData || destinationData.length === 0) {
            toast.error('Por favor, asegúrate de que el destino de la línea sea una parada válida.');
            setFinished(false);
            throw new Error('No valid destination stop found.');
        }
    }, [points]);

    return {
        points,
        setPoints,
        finished,
        setFinished,
        mousePos,
        setMousePos,
        addPoint,
        handleReset,
        handleFinished,
        handleDeletePoint,
        MAX_POINTS,
        hoveredIdx,
        setHoveredIdx,
    };
}