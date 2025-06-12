import type { BusStopFeature } from '@/models/geoserver'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const BusStopTable = ({ stop }: { stop: BusStopFeature }) => {
  return (
    <>
      <h2 className="px-2 font-bold">Parada seleccionada</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Nombre</TableHead>
            <TableHead className="font-bold">Estado</TableHead>
            <TableHead className="font-bold">Refugio</TableHead>
            <TableHead className="font-bold">Observaciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>{stop.properties.name}</TableCell>
            <TableCell>
              {stop.properties.status === 'ACTIVE'
                ? 'Habilitada'
                : 'Deshabilitada'}
            </TableCell>
            <TableCell>{stop.properties.hasShelter ? 'Sí' : 'No'}</TableCell>
            <TableCell>{stop.properties.description}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  )
}

export default BusStopTable
