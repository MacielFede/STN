import { Button, Drawer } from 'flowbite-react'
import { useBusLineContext } from '@/contexts/BusLineContext'
import type { BusLineFeature } from '@/models/geoserver'
import { useEffect, useState } from 'react'
import { GeoJSON } from 'react-leaflet'
import { _getLines, deleteBusLine, deleteStopLine, getStopLineByBusLineId } from '@/services/busLines'
import { getHoursAndMinutes } from '@/utils/helpers'
import { BASIC_LINE_FEATURE } from '@/utils/constants'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

const BusLinesCrud = ({ onClose }: {
    onClose: () => void
}) => {
    const [busLines, setBusLines] = useState<Array<BusLineFeature>>([])
    const { busLineStep, newBusLine, setNewBusLine, setBusLineStep, setPoints } = useBusLineContext()
    const queryClient = useQueryClient()
    const [displayedRoutes, setDisplayedRoutes] = useState<Array<BusLineFeature>>([])

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

        deleteBusLineMutation.mutate(id);
    }

    const handleEditLine = (line: BusLineFeature) => {
        setDisplayedRoutes([]);
        setNewBusLine(line);
        setBusLineStep('creation');
        setPoints(line.geometry.coordinates);
    }

    const handleViewLine = (line: BusLineFeature) => {
        setDisplayedRoutes((prev) => {
            const exists = prev.some((r) => r.id === line.id);
            if (exists) {
                return prev.filter((r) => r.id !== line.id);
            } else {
                return [...prev, line];
            }
        });
    }

    const handleEditAssociations = (line: BusLineFeature) => {
        setDisplayedRoutes([]);
        setNewBusLine(line);
        setBusLineStep('show-selection-popup');
        setPoints(line.geometry.coordinates);
    }

    const fetchBusLines = async () => {
        const lines = await _getLines();
        setBusLines(lines);
    }

    useEffect(() => {
        fetchBusLines();
    }, [newBusLine])

    return (
        <>
            {displayedRoutes.map((line) => (
                <GeoJSON key={line.id} data={line} style={{ color: 'blue' }} />
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
                                    <td className='p-2'>{getHoursAndMinutes(line.properties.schedule)}</td>
                                    <td className="p-2 flex gap-2 justify-center">
                                        <Button
                                            color="blue"
                                            size="xs"
                                            onClick={() => handleViewLine(line)}
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
