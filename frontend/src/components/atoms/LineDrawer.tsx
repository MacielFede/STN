import { Drawer } from 'flowbite-react'
import useCompanies from '@/hooks/useCompanies'
import type { BusLineProperties  } from '@/models/database'
import type { GeoJsonObject } from 'geojson'

interface BusLineWithGeometry extends BusLineProperties {
  geometry: GeoJsonObject
}
type Props = {
  lines: BusLineWithGeometry[]
  open: boolean
  onClose: () => void
  selectedLineIds: number[]
  onToggleLine: (id: number) => void
}

export function LineDrawer({
  lines,
  open,
  onClose,
  selectedLineIds,
  onToggleLine,
}: Props) {
  const { companies } = useCompanies()

  const getCompanyName = (companyId: number): string => {
    const company = companies?.find((c) => c.id === companyId)
    return company?.name ?? '(Empresa desconocida)'
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Líneas encontradas"
      position="bottom"
      className="z-3000 bg-gray-200 max-h-50"
      backdrop={false}
    >
      <ul className="space-y-2 p-4">
        {lines.map((line) => (
          <li
            key={line.id}
            className="flex justify-between items-center border-b pb-1"
          >
            <div>
              <div className="font-semibold">Línea {line.number}</div>
              <div className="text-sm text-gray-600">
                {getCompanyName((line.companyId))}
              </div>
            </div>
            <button
              onClick={() => onToggleLine(line.id)}
              className={`px-2 py-1 rounded text-sm ${
                selectedLineIds.includes(line.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-green-500 text-white'
              }`}
            >
              {selectedLineIds.includes(line.id) ? 'Ocultar' : 'Mostrar'}
            </button>
          </li>
        ))}
      </ul>
    </Drawer>
  )
}
