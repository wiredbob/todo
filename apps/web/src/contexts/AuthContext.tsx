import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  })

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed' }
      }

      // Update state with user and session data
      setState(prev => ({
        ...prev,
        user: data.data.user,
        session: data.data.session,
        loading: false
      }))

      // Store session in localStorage for persistence
      localStorage.setItem('authSession', JSON.stringify({
        user: data.data.user,
        session: data.data.session,
        timestamp: Date.now()
      }))

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      }
    }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed' }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      }
    }
  }

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local state and localStorage, even if logout request fails
      localStorage.removeItem('authSession')
      setState({
        user: null,
        session: null,
        loading: false
      })
    }
  }

  const refreshSession = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setState(prev => ({
            ...prev,
            user: data.data.user,
            session: data.data.session
          }))
        }
      }
    } catch (error) {
      console.error('Session refresh error:', error)
      // If refresh fails, clear session
      setState({
        user: null,
        session: null,
        loading: false
      })
    }
  }

  // Check for existing session on mount
  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      try {
        // First check localStorage for session (primarily for development)
        const savedSession = localStorage.getItem('authSession')
        if (savedSession) {
          try {
            const sessionData = JSON.parse(savedSession)
            // Check if session is still valid (not expired)
            const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in ms
            if (Date.now() - sessionData.timestamp < maxAge) {
              if (mounted) {
                setState({
                  user: sessionData.user,
                  session: sessionData.session,
                  loading: false
                })
              }
              return
            } else {
              // Session expired, remove it
              localStorage.removeItem('authSession')
            }
          } catch (parseError) {
            console.error('Session parsing error:', parseError)
            localStorage.removeItem('authSession')
          }
        }

        // Fallback to API check if no localStorage session
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include'
        })

        if (mounted && response.ok) {
          const data = await response.json()
          if (data.success && data.data.session) {
            setState({
              user: data.data.user,
              session: data.data.session,
              loading: false
            })
            return
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      }

      if (mounted) {
        setState({
          user: null,
          session: null,
          loading: false
        })
      }
    }

    checkSession()

    return () => {
      mounted = false
    }
  }, [])

  // Set up automatic token refresh
  useEffect(() => {
    if (!state.session) return

    const refreshInterval = setInterval(() => {
      refreshSession()
    }, 15 * 60 * 1000) // Refresh every 15 minutes

    return () => clearInterval(refreshInterval)
  }, [state.session, refreshSession])

  const contextValue: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshSession
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}