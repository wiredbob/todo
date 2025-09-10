import { useAuth as useAuthContext } from '../contexts/AuthContext'

export const useAuth = useAuthContext

// Re-export for convenience
export { AuthProvider } from '../contexts/AuthContext'
export type { User, Session } from '@supabase/supabase-js'