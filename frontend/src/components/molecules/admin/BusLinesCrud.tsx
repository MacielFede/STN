import { Button, Drawer } from 'flowbite-react'
import { useBusLineContext } from '@/contexts/BusLineContext'
import type { BusLineFeature } from '@/models/geoserver'
import { useEffect, useState } from 'react'
import { _getLines } from '@/services/busLines'
import { getHoursAndMinutes } from '@/utils/helpers'
import { BASIC_LINE_FEATURE } from '@/utils/constants'

const BusLinesCrud = ({ onClose }: {
    onClose: () => void
}) => {
    const [busLines, setBusLines] = useState<Array<BusLineFeature>>([])
    const { busLineStep, newBusLine, setNewBusLine, setBusLineStep } = useBusLineContext()

    useEffect(() => {
        const fetchBusLines = async () => {
            const lines = await _getLines();
            setBusLines(lines);
        }
        fetchBusLines();
    }, [newBusLine])

    return (
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
                                        onClick={() => console.log(`Edit line ${line.id}`)}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        color="blue"
                                        size="xs"
                                        onClick={() => console.log(`Delete line ${line.id}`)}
                                    >
                                        Editar paradas
                                    </Button>
                                    <Button
                                        color="red"
                                        size="xs"
                                        onClick={() => console.log(`Delete line ${line.id}`)}
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
    )
}

export default BusLinesCrud
