import { VercelRequest, VercelResponse } from '@vercel/node'
import { registerSchema } from '@simple-todo/shared'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    // Validate request body
    const validation = registerSchema.safeParse(req.body)
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: validation.error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }

    const { email, password, name } = validation.data

    // Create Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || ''
        }
      }
    })

    if (authError) {
      return res.status(400).json({
        success: false,
        error: authError.message
      })
    }

    // Success response
    return res.status(201).json({
      success: true,
      data: {
        user: authData.user,
        message: 'Registration successful. Please check your email for confirmation.'
      }
    })

  } catch (error) {
    console.error('Registration API error:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}