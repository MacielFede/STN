import { Button, Drawer } from 'flowbite-react'
import { useBusLineContext } from '@/contexts/BusLineContext'
import type { BusLineFeature } from '@/models/geoserver'
import { useEffect, useState, useMemo } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import { _getLines, deleteBusLine, deleteStopLine, getStopLineByBusLineId } from '@/services/busLines'
import { getHoursAndMinutes } from '@/utils/helpers'
import { BASIC_LINE_FEATURE } from '@/utils/constants'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { geometry } from '@turf/turf'
import { handleStopStatusAfterBusLineDeletion } from '@/services/stopStatusService'
import type { Company } from '@/models/database'
import { getCompanies } from '@/services/companies'

// Paleta de colores base
const ROUTE_COLORS = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
    '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
    '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
    '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'
];

// Genera un color aleatorio HEX que no esté en uso
function getRandomColor(usedColors: string[]): string {
    let color;
    do {
        color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    } while (usedColors.includes(color));
    return color;
}

const BusLinesCrud = ({ onClose }: { onClose: () => void }) => {
    const [busLines, setBusLines] = useState<Array<BusLineFeature>>([])
    const { busLineStep, newBusLine, setNewBusLine, setBusLineStep, setPoints } = useBusLineContext()
    const queryClient = useQueryClient()
    const [displayedRoutes, setDisplayedRoutes] = useState<Array<BusLineFeature>>([])
    const [companies, setCompanies] = useState<Array<Company>>([])
    const map = useMap()

    const travelToGeometry = (geometry: number[][], type: string = 'fit') => {
        const latLngs = geometry
            .map(([lng, lat]: [number, number]) => [lat, lng])
            .filter((coord): coord is [number, number] =>
                Array.isArray(coord) && coord.length === 2 &&
                typeof coord[0] === 'number' && typeof coord[1] === 'number'
            );

        switch (type) {
            case 'fit':
                map.fitBounds(latLngs as [number, number][]);
                break;
            default:
                map.flyToBounds(latLngs as [number, number][], {
                    padding: [50, 50],
                });
                break;
        }
    }

    // Asigna un color único a cada línea visualizada
    const routeColors = useMemo(() => {
        const usedColors: string[] = [];
        const colorMap: Record<string, string> = {};
        displayedRoutes.forEach((line) => {
            let color = ROUTE_COLORS.find(c => !usedColors.includes(c));
            if (!color) color = getRandomColor(usedColors);
            colorMap[line.id] = color;
            usedColors.push(color);
        });
        return colorMap;
    }, [displayedRoutes]);

    const deleteBusLineMutation = useMutation({
        mutationFn: async (id: string) => {
            try {
                const stopsAssociations = await getStopLineByBusLineId(id);
                stopsAssociations.forEach(async (association) => {
                    await deleteStopLine(String(association.id));
                });
                await queryClient.invalidateQueries({ queryKey: ['bus-lines'] })
                await queryClient.invalidateQueries({ queryKey: ['stops'] })
                await deleteBusLine(id);
                
                await handleStopStatusAfterBusLineDeletion(stopsAssociations)
                toast.success('Línea eliminada correctamente', {
                    closeOnClick: true,
                    position: 'top-right',
                    toastId: 'delete-line-toast',
                })
            } catch (error) {
                toast.error('Error al eliminar la línea', {
                    closeOnClick: true,
                    position: 'top-right',
                    toastId: 'delete-line-toast-error',
                })
                console.error('Error al eliminar la línea:', error)
            }
        },
        onSuccess: () => {
            fetchBusLines();
        },
    })

    const handleDeleteBusLine = (id: string) => {
        if (!id) return;
        const confirmed = window.confirm("¿Estás seguro de que deseas eliminar esta línea? Todos los recorridos asociados serán eliminados.");
        if (!confirmed) return;
        setDisplayedRoutes([]);
        deleteBusLineMutation.mutate(id);
    }

    const handleEditLine = (line: BusLineFeature) => {
        setDisplayedRoutes([]);
        setNewBusLine(line);
        setBusLineStep('creation');
        setPoints(line.geometry.coordinates);
        travelToGeometry(line.geometry.coordinates);
    }

    const handleViewLine = (line: BusLineFeature, type: string = 'show') => {
        setDisplayedRoutes((prev) => {
            const exists = prev.some((r) => r.id === line.id);
            if (exists) {
                return prev.filter((r) => r.id !== line.id);
            } else {
                return [...prev, line];
            }
        });
        if (type === 'hide') return;  
        travelToGeometry(line.geometry.coordinates, 'fly');
    }

    const handleEditAssociations = (line: BusLineFeature) => {
        setDisplayedRoutes([]);
        setNewBusLine(line);
        setBusLineStep('show-selection-popup');
        setPoints(line.geometry.coordinates);
        travelToGeometry(line.geometry.coordinates);
    }

    const fetchBusLines = async () => {
        const lines = await _getLines();
        setBusLines(lines);
    }

    const fetchCompanies = async () => {
        const companies = await getCompanies();
        setCompanies(companies);
    }

    useEffect(() => {
        fetchBusLines();
        fetchCompanies();
    }, [newBusLine])

    return (
        <>
            {displayedRoutes.map((line) => (
                <GeoJSON
                    key={line.id}
                    data={line}
                    style={{ color: routeColors[line.id] || '#000', weight: 5 }}
                />
            ))}
            <Drawer
                open={busLineStep === 'show-crud'}
                onClose={onClose}
                position="left"
                className="z-[5000] bg-white w-full w-full max-h-screen max-w-fit overflow-y-auto"
                backdrop={false}
            >
                <div className="p-4 bg-white rounded shadow w-full mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Líneas de Ómnibus</h2>
                        <Button
                            onClick={() => {
                                setNewBusLine(BASIC_LINE_FEATURE);
                                setBusLineStep('creation');
                            }}
                            color="green"
                        >
                            + Nueva Línea
                        </Button>
                    </div>
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 text-left">Número</th>
                                <th className="p-2 text-left">Origen</th>
                                <th className="p-2 text-left">Destino</th>
                                <th className="p-2 text-left">Estado</th>
                                <th className="p-2 text-left">Empresa</th>
                                <th className="p-2 text-left">Salida</th>
                                <th className="p-2 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {busLines.map(line => (
                                <tr key={line.id} className="border-t">
                                    <td className="p-2">{line.properties.number}</td>
                                    <td className="p-2">{line.properties.origin}</td>
                                    <td className="p-2">{line.properties.destination}</td>
                                    <td className="p-2">{line.properties.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}</td>
                                    <td className="p-2">{line.properties.companyId ? companies.find(c => c.id === line.properties.companyId)?.name?.toUpperCase() : 'No asignada'}</td>
                                    <td className='p-2'>{getHoursAndMinutes(line.properties.schedule)}</td>
                                    <td className="p-2 flex gap-2 justify-center">
                                        <Button
                                            color={displayedRoutes.some(r => r.id === line.id) ? 'gray' : 'blue'}
                                            size="xs"
                                            style={{ minWidth: '100px', border: routeColors[line.id] ? `2px solid ${routeColors[line.id]}` : '1px solid #ccc' }}
                                            onClick={() => handleViewLine(line, displayedRoutes.some(r => r.id === line.id) ? 'hide' : 'show')}
                                        >
                                            {displayedRoutes.some(r => r.id === line.id) ? 'Ocultar' : 'Ver Recorrido'}
                                        </Button>
                                        <Button
                                            color="blue"
                                            size="xs"
                                            onClick={() => handleEditLine(line)}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            color="blue"
                                            size="xs"
                                            onClick={() => handleEditAssociations(line)}
                                        >
                                            Editar paradas
                                        </Button>
                                        <Button
                                            color="red"
                                            size="xs"
                                            onClick={() => handleDeleteBusLine(String(line.properties.id))}
                                        >
                                            Eliminar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Drawer>
        </>
    )
}

export default BusLinesCrud