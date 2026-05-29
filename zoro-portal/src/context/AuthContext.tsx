import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { findUserByCredential, getUsers, onMockStoreChange, registerUser } from '../lib/mockStore'
import type { User } from '../types'

const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123',
}

const AUTH_STORAGE_KEY = 'zoro_admin_user'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<{ error?: string; user?: User }>
  signup: (name: string, email: string, password: string) => Promise<{ error?: string; user?: User }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY)
      if (!savedUser) {
        setUser(null)
        return
      }

      const parsedUser = JSON.parse(savedUser) as User
      const freshUser = getUsers().find(item => item.id === parsedUser.id) ?? parsedUser
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(freshUser))
      setUser(freshUser)
    }

    try {
      loadUser()
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      setUser(null)
    } finally {
      setLoading(false)
    }

    return onMockStoreChange(() => {
      try {
        loadUser()
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        setUser(null)
      }
    })
  }, [])

  const login = async (username: string, password: string) => {
    const email = username.trim().toLowerCase()
    const matchedUser = findUserByCredential(email, password)

    if (matchedUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matchedUser))
      setUser(matchedUser)
      return { user: matchedUser }
    }

    const adminHint = email === ADMIN_CREDENTIALS.email ? 'admin' : 'user'
    return { error: `Invalid ${adminHint} credentials` }
  }

  const signup = async (name: string, email: string, password: string) => {
    const result = registerUser(name, email, password)
    if (result.error || !result.user) return result

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result.user))
    setUser(result.user)
    return { user: result.user }
  }

  const logout = async () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
