import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
})

export const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').optional(),
})

export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const passwordUpdateSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  token: z.string().min(1, 'Reset token is required'),
})

// Type exports
export type LoginRequest = z.infer<typeof loginSchema>
export type RegisterRequest = z.infer<typeof registerSchema>
export type ProfileUpdateRequest = z.infer<typeof profileUpdateSchema>
export type PasswordResetRequest = z.infer<typeof passwordResetSchema>
export type PasswordUpdateRequest = z.infer<typeof passwordUpdateSchema>

// User types
export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: User
}

// API Response types
export interface AuthResponse {
  success: boolean
  data?: {
    user?: User
    session?: AuthSession
  }
  error?: string
}

export interface ProfileResponse {
  success: boolean
  data?: User
  error?: string
}