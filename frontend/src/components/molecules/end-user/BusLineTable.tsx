import { useCallback, useMemo } from 'react'
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
import useCompanies from '@/hooks/useCompanies'
import { getHoursAndMinutes } from '@/utils/helpers'
import useStopLines from '@/hooks/useStopLines'
import Modal from '@/components/atoms/Modal'
import { useGeoContext } from '@/contexts/GeoContext'

type BusLineTableProps = {
  onDisplayRoute: (route: BusLineFeature) => void
  displayedRoutes: Array<BusLineFeature>
  activeStopId: number | undefined
  selectedRouteId: string
}

export default function BusLinetable({
  onDisplayRoute,
  displayedRoutes,
  activeStopId,
  selectedRouteId,
}: BusLineTableProps) {
  const { companies } = useCompanies()
  const { stopSpecificLines } = useStopLines(activeStopId)
  const { lines: filteredLines } = useLines()
  const { lines: allLines } = useAllLines()
  const { displayDefaultLines } = useGeoContext()

  const validLineIds = useMemo(() => {
    return activeStopId && stopSpecificLines
      ? new Set(
          stopSpecificLines
            .filter((rel) => rel.isEnabled)
            .map((rel) => rel.lineId),
        )
      : null
  }, [activeStopId, stopSpecificLines])

  const linesToShow = useMemo(() => {
    return activeStopId && validLineIds
      ? allLines?.filter(
          (line) => line.properties.id && validLineIds.has(line.properties.id),
        )
      : filteredLines
  }, [filteredLines, allLines, validLineIds, activeStopId])

  const lineScheduleMap = useMemo(() => {
    const map = new Map<number, Array<string>>()
    if (stopSpecificLines) {
      stopSpecificLines.forEach((stopLine) => {
        const schedule = stopLine.estimatedTime.slice(0, -3)
        if (map.has(stopLine.lineId)) {
          map.get(stopLine.lineId)?.push(schedule)
        } else {
          map.set(stopLine.lineId, [schedule])
        }
      })
    }
    return map
  }, [stopSpecificLines])

  const getLineSchedule = useCallback(
    (line: BusLineFeature) => {
      return (
        (!!line.properties.id && lineScheduleMap.get(line.properties.id)) || []
      )
    },
    [lineScheduleMap],
  )

  const tableTitle = useMemo(() => {
    return displayDefaultLines
      ? 'Lineas cercanas a tu ubicación (los filtros no funcionaran hasta que dejes de ver las lineas cercanas)'
      : activeStopId
        ? `Líneas que pasan por esta parada`
        : 'Líneas filtradas'
  }, [activeStopId, displayDefaultLines])

  return linesToShow && linesToShow.length > 0 ? (
    <>
      <h2 className="px-2 font-bold">{tableTitle}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Línea</TableHead>
            <TableHead className="font-bold">Origen</TableHead>
            <TableHead className="font-bold">Destino</TableHead>
            <TableHead className="font-bold">Empresa</TableHead>
            <TableHead className="font-bold">
              {activeStopId ? 'Horarios' : 'Horario de salida'}
            </TableHead>
            <TableHead className="font-bold">Recorrido</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {linesToShow.map((line) => (
            <TableRow
              key={line.id}
              className={line.id === selectedRouteId ? 'bg-red-400' : ''}
              ref={(el) => {
                if (line.id === selectedRouteId)
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
            >
              <TableCell className="font-medium">
                {line.properties.number}
              </TableCell>
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
                {activeStopId ? (
                  <Modal
                    trigger={
                      <Button
                        variant="outline"
                        className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        Ver horarios
                      </Button>
                    }
                    type="Schedule"
                    body={
                      <div>
                        {line.properties.schedule &&
                          `Horario de salida: ${getHoursAndMinutes(line.properties.schedule)}`}
                        <br />
                        {'Horarios estimados: '}
                        {getLineSchedule(line).map(
                          (schedule, i, originalArray) =>
                            originalArray.length - 1 > i
                              ? `${schedule}, `
                              : schedule,
                        )}
                      </div>
                    }
                  />
                ) : (
                  line.properties.schedule &&
                  getHoursAndMinutes(line.properties.schedule)
                )}
              </TableCell>
              <TableCell>
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
            </TableRow>
          ))}
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
