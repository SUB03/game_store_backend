import * as React from 'react'

export interface AuthContext {
  login: (username: string) => Promise<void>
  logout: () => Promise<void>
  // user: User | null
}

const AuthContext = React.createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const logout = React.useCallback(async () => {
  }, [])

  const login = React.useCallback(async () => {
  }, [])

  return (
    <AuthContext.Provider value={{ login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}