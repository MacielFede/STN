import { Drawer } from 'flowbite-react'
import useCompanies from '@/hooks/useCompanies'
import type { Line } from '@/models/database'

type Props = {
  lines: Line[]
  open: boolean
  onClose: () => void
  selectedLineIds: string[]
  onToggleLine: (id: string) => void
}

export function LineDrawer({
  lines,
  open,
  onClose,
  selectedLineIds,
  onToggleLine,
}: Props) {
  const { companies } = useCompanies()

  const getCompanyName = (companyId: string): string => {
    const company = companies?.find((c) => String(c.id) === String(companyId))
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
                {getCompanyName(line.companyId)}
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
