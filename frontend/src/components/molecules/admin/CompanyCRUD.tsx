import { useState } from 'react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import {
  createCompany,
  deleteCompany,
  updateCompany,
} from '@/services/companies'
import useCompanies from '@/hooks/useCompanies'

const CompanyCRUD = () => {
  const { companies, refetch } = useCompanies()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [newName, setNewName] = useState('')
  const [mode, setMode] = useState<'add' | 'edit' | null>(null)

  const handleAdd = async () => {
    if (newName.trim() === '') return
    try {
      await createCompany(newName)
      await refetch()
      setNewName('')
      setMode(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = async () => {
    if (selectedId == null || newName.trim() === '') return
    try {
      await updateCompany(selectedId, newName)
      await refetch()
      setSelectedId(null)
      setNewName('')
      setMode(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (selectedId == null) return
    try {
      await deleteCompany(selectedId)
      await refetch()
      setSelectedId(null)
      setMode(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex flex-col gap-2 max-h-40 overflow-y-auto border p-2 rounded">
        {companies?.map((company) => (
          <div
            key={company.id}
            onClick={() => {
              if (selectedId === company.id) {
                setSelectedId(null)
                setNewName('')
                setMode(null)
              } else {
                setSelectedId(company.id)
                setNewName(company.name)
                setMode(null)
              }
            }}
            className={`cursor-pointer px-2 py-1 rounded ${
              selectedId === company.id ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
          >
            {company.name}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => {
            setMode('add')
            setNewName('')
            setSelectedId(null)
          }}
        >
          Agregar empresa
        </Button>

        {selectedId !== null && (
          <>
            <Button onClick={() => setMode('edit')}>Modificar</Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </>
        )}
      </div>

      {(mode === 'add' || mode === 'edit') && (
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre de la empresa"
          />
          <Button onClick={mode === 'add' ? handleAdd : handleEdit}>
            {mode === 'add' ? 'Guardar' : 'Actualizar'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default CompanyCRUD
