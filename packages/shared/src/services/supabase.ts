import { createClient } from '@supabase/supabase-js'

// Environment variables - hardcoded from .env to avoid process/import.meta issues
const supabaseUrl = 'https://bhhfknlqaaucteayasfa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoaGZrbmxxYWF1Y3RlYXlhc2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5Mjk2ODEsImV4cCI6MjA3MjUwNTY4MX0.tVVZWlv06rbWPrwrRTJ-Ce_QIaZwUIspD41NOUkT0Nw'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}