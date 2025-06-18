import { useMemo } from 'react'
import { Button } from '../../ui/button'
import { useGeoContext } from '@/contexts/GeoContext'
import useCompanies from '@/hooks/useCompanies'

const CompanySelector = () => {
  const { companies } = useCompanies()
  const { toogleEndUserFilter, endUserFilters } = useGeoContext()

  const activeFilteredCompany = useMemo(() => {
    const companyFilter = endUserFilters.find(
      (filter) => filter.name === 'company',
    )
    return companyFilter?.data?.name || 'Seleccionar'
  }, [endUserFilters])

  return (
    <div className="flex flex-col gap-4 p-4 bg-white shadow-md rounded-md w-fit max-w-[300px] h-fit">
      <div className="flex flex-col gap-2">
        <label className="font-semibold" htmlFor="company">
          Filtrar lineas por empresa
        </label>
        <select
          id="company"
          className="border rounded px-3 py-2"
          value={activeFilteredCompany}
          onChange={(e) => {
            const selectedCompanyId = companies?.find(
              (company) => company.name === e.target.value,
            )?.id
            if (e.target.value && selectedCompanyId) {
              toogleEndUserFilter({
                name: 'company',
                isActive: true,
                data: {
                  id: selectedCompanyId,
                  name: e.target.value,
                },
              })
            }
          }}
        >
          <option value="Seleccionar" disabled>
            Seleccionar
          </option>
          {companies?.map((comp) => (
            <option key={comp.id} value={comp.name}>
              {comp.name}
            </option>
          ))}
        </select>
        {activeFilteredCompany !== 'Seleccionar' && (
          <Button
            className="bg-red-800"
            onClick={() =>
              toogleEndUserFilter({ name: 'company', isActive: false })
            }
          >
            Limpiar filtro
          </Button>
        )}
      </div>
    </div>
  )
}

export default CompanySelector
