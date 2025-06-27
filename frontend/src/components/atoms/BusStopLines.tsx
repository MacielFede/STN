'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { fetchBusLinesByPoint, getStopLines } from '../../services/busLines'
import type { BusLineFeature } from '@/models/geoserver'
import type { BusStopLine, Company } from '@/models/database'
import { getCompanies } from '@/services/company'


type Props = {
  point: [number, number]
  onSelectRoute: (route: BusLineFeature) => void
  selectedRoutes: BusLineFeature[]
}


export default function BusStopLines({ point, onSelectRoute, selectedRoutes }: Props) {
  const [busLines, setBusLines] = useState<BusLineFeature[]>([])
  const [busStopLines, setBusStopLine] = useState<BusStopLine[]>([])
  const [companies, setcompanies] = useState<Company[]>([])



  useEffect(() => {
    async function getData() {

      const lines = await fetchBusLinesByPoint(point)
      setBusLines(lines)

      const company = await getCompanies()
      setcompanies(company)
    }
    if (point) {
      getData()
    }
  }, [point])


  return (
    <div className="p-4">


      <h2 className="text-lg font-semibold mb-4">Líneas de bus que pasan por esta parada</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Línea</TableHead>
            <TableHead>Origen</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Empresa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
  {busLines.map((line) => {
    const company = companies.find(c => c.id === line.properties.companyId)

    return (
      
      <TableRow key={line.id}>
        <TableCell>{line.properties.number}</TableCell>
        <TableCell>{line.properties.origin}</TableCell>
        <TableCell>{line.properties.destination}</TableCell>
        <TableCell>{company?.name ?? 'Empresa desconocida'}</TableCell>
        
        <TableCell>
          <Button
          
            variant="outline"
            className={
              selectedRoutes.some((r) => r.id === line.id)
                ? 'text-red-600 border-red-600 hover:bg-red-600 hover:text-white'
                : 'text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white'
            }
            size="sm"
            onClick={() => onSelectRoute(line)}
          >
            {selectedRoutes.some((r) => r.id === line.id) ? 'Dejar de ver' : 'Ver Recorrido'}
          </Button>
        </TableCell>
      </TableRow>
    )
  })}
</TableBody>
      </Table>
    </div>
  )
}
