import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { auth } from '../lib/api'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    auth.me().then(({ data }) => setUser(data.user)).catch(() => setUser(null)).finally(() => setLoading(false))
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const { data } = await auth.login(username, password)
      setUser(data.user)
      return {}
    } catch (err: any) {
      return { error: err?.response?.data?.error || 'Login failed' }
    }
  }

  const logout = async () => {
    await auth.logout()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)