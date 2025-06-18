import type { Company } from '@/models/database'
import { api } from '@/api/config'

export const getCompanies = async (): Promise<Array<Company>> => {
  const { data } = await api.get('/companies', {})
  return data
}

export const createCompany = async (name: string): Promise<Company> => {
  const { data } = await api.post('/companies', { name }, {})
  return data
}

export const updateCompany = async (
  id: number,
  name: string,
): Promise<Company> => {
  const { data } = await api.put(`/companies/${id}`, { name }, {})
  return data
}

export const deleteCompany = async (id: number): Promise<void> => {
  await api.delete(`/companies/${id}`, {})
}