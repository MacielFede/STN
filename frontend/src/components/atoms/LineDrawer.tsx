import { Drawer } from 'flowbite-react'

type Line = {
  id: string
  number: string
  companyName: string
}

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
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Líneas encontradas"
      position="bottom"
      className="z-3000 bg-gray-200 max-h-50"
      backdrop={false}
    >
    {/* <Drawer open={open} onClose={onClose} title="Líneas encontradas"> */}
      <ul className="space-y-2 p-4">
        {lines.map((line) => (
          <li
            key={line.id}
            className="flex justify-between items-center border-b pb-1"
          >
            <div>
              <div className="font-semibold">Línea {line.number}</div>
              <div className="text-sm text-gray-600">{line.companyName}</div>
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
