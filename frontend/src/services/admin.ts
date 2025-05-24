import type { AxiosResponse } from 'axios'
import api from '@/api/config'

export type LoginTransactionResponse = {
  token: string
}

export const login = async (email: string, password: string) => {
  const { data }: AxiosResponse<LoginTransactionResponse> =
    await api.post('auth/login', {
      username: email,
      password,
    })
  return data
}
