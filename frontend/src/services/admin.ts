import type { AxiosResponse } from 'axios'
import type { LoginTransactionResponse } from '@/models/database'
import { api } from '@/api/config'

export const login = async (email: string, password: string) => {
  const { data }: AxiosResponse<LoginTransactionResponse> = await api.post(
    'auth/login',
    {
      username: email,
      password,
    },
  )
  return data
}
