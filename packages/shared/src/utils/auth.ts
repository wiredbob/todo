import { supabase } from '../services/supabase'

export class AuthUtils {
  // Cookie utilities for secure token storage
  static setCookie(name: string, value: string, days = 1) {
    if (typeof document === 'undefined') return
    
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict; Secure`
  }

  static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null
    
    return document.cookie.split('; ').reduce((r: string | null, v: string) => {
      const parts = v.split('=')
      return parts[0] === name ? decodeURIComponent(parts[1]) : r
    }, null)
  }

  static deleteCookie(name: string) {
    if (typeof document === 'undefined') return
    
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict; Secure`
  }

  // Token validation
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return Date.now() >= payload.exp * 1000
    } catch {
      return true
    }
  }

  // Session management
  static async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        throw new Error(error.message)
      }

      return data.session
    } catch (error) {
      console.error('Session refresh failed:', error)
      return null
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return !!session?.access_token
    } catch {
      return false
    }
  }

  // Clear all auth data
  static clearAuthData() {
    this.deleteCookie('sb-access-token')
    this.deleteCookie('sb-refresh-token')
    
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('sb-auth-token')
    }
    
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('sb-auth-token')
    }
  }

  // Get user role from token
  static getUserRole(token?: string): string | null {
    try {
      const actualToken = token || this.getCookie('sb-access-token')
      if (!actualToken) return null

      const payload = JSON.parse(atob(actualToken.split('.')[1]))
      return payload.role || 'user'
    } catch {
      return null
    }
  }

  // Format auth errors for user display
  static formatAuthError(error: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password',
      'Email not confirmed': 'Please check your email and confirm your account',
      'User already registered': 'An account with this email already exists',
      'Password should be at least 8 characters': 'Password must be at least 8 characters long',
      'Invalid email': 'Please enter a valid email address',
      'Too many requests': 'Too many attempts. Please try again later',
    }

    return errorMap[error] || error
  }

  // Password strength validation
  static validatePasswordStrength(password: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}