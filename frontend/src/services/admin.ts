import type { AxiosResponse } from 'axios'
import api from '@/api/config'

export type LoginTransactionResponse = {
  token: string
}

export type Company = {
  id: number
  name: string
}

export const login = async (email: string, password: string) => {
  const { data }: AxiosResponse<LoginTransactionResponse> =
    await api.post('auth/login', {
      username: email,
      password,
    })
  localStorage.setItem('token', data.token)
  return data
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getCompanies = async (): Promise<Company[]> => {
  const { data } = await api.get('/companies', {
    headers: getAuthHeaders(),
  })
  return data
}

export const createCompany = async (name: string): Promise<Company> => {
  const { data } = await api.post('/companies', { name }, {
    headers: getAuthHeaders(),
  })
  return data
}

export const updateCompany = async (id: number, name: string): Promise<Company> => {
  const { data } = await api.put(`/companies/${id}`, { name }, {
    headers: getAuthHeaders(),
  })
  return data
}

export const deleteCompany = async (id: number): Promise<void> => {
  await api.delete(`/companies/${id}`, {
    headers: getAuthHeaders(),
  })
}