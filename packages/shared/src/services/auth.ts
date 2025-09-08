import { supabase } from './supabase'
import type { 
  LoginRequest, 
  RegisterRequest, 
  ProfileUpdateRequest, 
  PasswordResetRequest,
  AuthResponse,
  ProfileResponse,
  User 
} from '../types/auth'

export class AuthService {
  // Register new user
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const { email, password, name } = data

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      })

      if (authError) {
        return { 
          success: false, 
          error: authError.message 
        }
      }

      return { 
        success: true, 
        data: { 
          user: authData.user ? {
            id: authData.user.id,
            email: authData.user.email!,
            name: authData.user.user_metadata?.name || '',
            created_at: authData.user.created_at,
            updated_at: authData.user.updated_at || authData.user.created_at
          } : undefined,
          session: authData.session ? {
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
            expires_in: authData.session.expires_in || 3600,
            token_type: authData.session.token_type,
            user: {
              id: authData.session.user.id,
              email: authData.session.user.email!,
              name: authData.session.user.user_metadata?.name || '',
              created_at: authData.session.user.created_at,
              updated_at: authData.session.user.updated_at || authData.session.user.created_at
            }
          } : undefined
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      }
    }
  }

  // Login user
  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const { email, password } = data

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        return { 
          success: false, 
          error: authError.message 
        }
      }

      return { 
        success: true, 
        data: { 
          user: authData.user ? {
            id: authData.user.id,
            email: authData.user.email!,
            name: authData.user.user_metadata?.name || '',
            created_at: authData.user.created_at,
            updated_at: authData.user.updated_at || authData.user.created_at
          } : undefined,
          session: authData.session ? {
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
            expires_in: authData.session.expires_in || 3600,
            token_type: authData.session.token_type,
            user: {
              id: authData.session.user.id,
              email: authData.session.user.email!,
              name: authData.session.user.user_metadata?.name || '',
              created_at: authData.session.user.created_at,
              updated_at: authData.session.user.updated_at || authData.session.user.created_at
            }
          } : undefined
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }
    }
  }

  // Logout user
  static async logout(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return { 
          success: false, 
          error: error.message 
        }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Logout failed' 
      }
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null

      return {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || '',
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at
      }
    } catch (error) {
      return null
    }
  }

  // Get current session
  static async getCurrentSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    } catch (error) {
      return null
    }
  }

  // Update user profile
  static async updateProfile(data: ProfileUpdateRequest): Promise<ProfileResponse> {
    try {
      const { name, email } = data
      
      const updateData: any = {}
      if (name) updateData.name = name
      if (email) updateData.email = email

      const { data: userData, error } = await supabase.auth.updateUser({
        data: updateData,
        ...(email && { email })
      })

      if (error) {
        return { 
          success: false, 
          error: error.message 
        }
      }

      if (!userData.user) {
        return { 
          success: false, 
          error: 'Failed to update profile' 
        }
      }

      return { 
        success: true, 
        data: {
          id: userData.user.id,
          email: userData.user.email!,
          name: userData.user.user_metadata?.name || '',
          created_at: userData.user.created_at,
          updated_at: userData.user.updated_at || userData.user.created_at
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Profile update failed' 
      }
    }
  }

  // Reset password
  static async resetPassword(data: PasswordResetRequest): Promise<AuthResponse> {
    try {
      const { email } = data

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined
      })

      if (error) {
        return { 
          success: false, 
          error: error.message 
        }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Password reset failed' 
      }
    }
  }

  // Update password with reset token
  static async updatePassword(password: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) {
        return { 
          success: false, 
          error: error.message 
        }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Password update failed' 
      }
    }
  }

  // Auth state change listener
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}