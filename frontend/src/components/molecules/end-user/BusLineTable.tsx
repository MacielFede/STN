import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table'
import type { BusLineFeature } from '@/models/geoserver'
import { Button } from '@/components/ui/button'
import useLines from '@/hooks/useLines'
import Modal from '@/components/atoms/Modal'
import useCompanies from '@/hooks/useCompanies'
import { getHoursAndMinutes } from '@/utils/helpers'

type BusLineTableProps = {
  onDisplayRoute: (route: BusLineFeature) => void
  displayedRoutes: Array<BusLineFeature>
  activeStopId: number | undefined
}

export default function BusLinetable({
  onDisplayRoute,
  displayedRoutes,
  activeStopId,
}: BusLineTableProps) {
  const { lines } = useLines()
  const { companies } = useCompanies()

  return lines.length > 0 ? (
    <>
      <h2 className="px-2 font-bold">Lineas filtradas</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Línea</TableHead>
            <TableHead className="font-bold">Origen</TableHead>
            <TableHead className="font-bold">Destino</TableHead>
            {!!companies && (
              <TableHead className="font-bold">Empresa</TableHead>
            )}
            <TableHead className="font-bold">Horario de salida</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line) => (
            <TableRow key={line.id}>
              <TableCell>{line.properties.number}</TableCell>
              <TableCell>{line.properties.origin}</TableCell>
              <TableCell>{line.properties.destination}</TableCell>
              <TableCell>
                {
                  companies?.find(
                    (company) => company.id === line.properties.companyId,
                  )?.name
                }
              </TableCell>
              <TableCell>
                {line.properties.schedule &&
                  getHoursAndMinutes(line.properties.schedule)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  className={
                    displayedRoutes.some((r) => r.id === line.id)
                      ? 'text-red-600 border-red-600 hover:bg-red-600 hover:text-white'
                      : 'text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white'
                  }
                  size="sm"
                  onClick={() => onDisplayRoute(line)}
                >
                  {displayedRoutes.some((r) => r.id === line.id)
                    ? 'Dejar de ver'
                    : 'Ver Recorrido'}
                </Button>
              </TableCell>
              {activeStopId && (
                <TableCell className="text-right">
                  <Modal
                    trigger={
                      <Button variant="outline" size="sm">
                        Ver horarios
                      </Button>
                    }
                    body={'Aca estan los horarios del bondi'}
                    type="Lines"
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  ) : null
}
