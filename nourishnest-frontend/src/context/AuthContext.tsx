import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { usersApi } from '@/lib/api/users.api'
import { authApi } from '@/lib/api/auth.api'
import { clearAuth, setAccessToken } from '@/lib/api/client'
import type { User } from '@/types/user.types'
import type { RegisterPayload } from '@/types/auth.types'
import { queryClient } from '@/lib/queryClient'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterPayload) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null)
      queryClient.clear()
    }
    window.addEventListener('auth:force-logout', handleForceLogout)
    return () => window.removeEventListener('auth:force-logout', handleForceLogout)
  }, [])

  // Restore session on page load by silently refreshing (cookie is sent automatically)
  useEffect(() => {
    authApi.refresh()
      .then(({ access }) => {
        setAccessToken(access)
        return usersApi.getMe()
      })
      .then((me) => setUser(me))
      .catch(() => clearAuth())
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { access } = await authApi.login({ email, password })
      setAccessToken(access)
      const me = await usersApi.getMe()
      setUser(me)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (data: RegisterPayload) => {
    setIsLoading(true)
    try {
      const { access } = await authApi.register(data)
      setAccessToken(access)
      const me = await usersApi.getMe()
      setUser(me)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setUser(null)
    queryClient.clear()
    authApi.logout().catch(() => undefined)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
