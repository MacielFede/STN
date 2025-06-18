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
import useAllLines from '@/hooks/useAllLines'
import Modal from '@/components/atoms/Modal'
import useCompanies from '@/hooks/useCompanies'
import { getHoursAndMinutes } from '@/utils/helpers'
import useStopLines from '@/hooks/useStopLines'
import { useAuthContext } from '@/contexts/AuthContext'
import { useBusLineContext } from '@/contexts/BusLineContext'

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
  const { companies } = useCompanies()
  const { stopSpecificLines } = useStopLines(activeStopId)
  const { lines: filteredLines } = useLines()
  const { lines: allLines } = useAllLines()
  const { isAdmin } = useAuthContext();
  const { setBusLineStep, setNewBusLine, loadBusLineForEdit} = useBusLineContext();

  const linesToShow = activeStopId && stopSpecificLines
    ? allLines?.filter(line =>
      stopSpecificLines.some(
        rel => rel.lineId === line.properties.id
      )
    )
    : filteredLines
  console.log("allLines", allLines?.map(l => l.id))
  console.log("stopSpecificLines", stopSpecificLines?.map(s => s.lineId))



  const tableTitle = activeStopId
    ? `Líneas que pasan por esta parada`
    : 'Líneas filtradas'

  return linesToShow && linesToShow.length > 0 ? (
    <>
      <h2 className="px-2 font-bold">{tableTitle}</h2>
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
            <TableHead className="font-bold">Recorrido</TableHead>

          </TableRow>
        </TableHeader>
        <TableBody>
          {linesToShow.map((line) => {
            // Obtener información específica de la línea en esta parada si existe
            const lineStopInfo = activeStopId && stopSpecificLines
              ? stopSpecificLines.find(rel => rel.lineId === Number(line.id))
              : null

            return (
              <TableRow key={line.id}>
                <TableCell className="font-medium">{line.properties.number}</TableCell>
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
                  {line.properties.schedule && getHoursAndMinutes(line.properties.schedule)}
                </TableCell>
                <TableCell >
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
                      ? 'Ocultar'
                      : 'Ver Recorrido'}
                  </Button>
                </TableCell>
                {isAdmin && (
                  <TableCell >
                    <Button
                      variant="outline"
                      className={
                        'text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white'
                      }
                      size="sm"
                      onClick={() => loadBusLineForEdit(line)}
                    >
                      Editar Recorrido
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </>
  ) : activeStopId ? (
    <div className="px-2 py-4 text-center text-gray-500">
      <p>No hay líneas disponibles para esta parada</p>
    </div>
  ) : (
    <div className="px-2 py-4 text-center text-gray-500">
      <p>No hay líneas que coincidan con los filtros seleccionados</p>
    </div>
  )
}