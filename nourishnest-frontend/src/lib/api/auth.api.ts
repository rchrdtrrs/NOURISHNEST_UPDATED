import { publicClient } from './client'
import type { LoginPayload, RegisterPayload } from '@/types/auth.types'

export const authApi = {
  login: async (data: LoginPayload): Promise<{ access: string }> => {
    const res = await publicClient.post('/auth/login/', data)
    return res.data
  },

  register: async (data: RegisterPayload): Promise<{ access: string; user: unknown }> => {
    const res = await publicClient.post('/auth/register/', data)
    return res.data
  },

  refresh: async (): Promise<{ access: string }> => {
    const res = await publicClient.post('/auth/token/refresh/')
    return res.data
  },

  logout: async (): Promise<void> => {
    await publicClient.post('/auth/logout/')
  },
}
