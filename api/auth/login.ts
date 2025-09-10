import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Secure CORS - only allow same domain or local development
  const isProduction = process.env.NODE_ENV === 'production'
  
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
  
  if (!isProduction) {
    // Development: allow localhost for Vite dev server
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
  }
  // Production: no CORS header = same-origin only (most secure)

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      })
    }

    // Create Supabase client
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Authenticate user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      return res.status(400).json({
        success: false,
        error: authError.message
      })
    }

    if (!authData.user || !authData.session) {
      return res.status(400).json({
        success: false,
        error: 'Login failed'
      })
    }

    // Set secure session cookie
    const isProduction = process.env.NODE_ENV === 'production'
    const sameSitePolicy = isProduction ? 'Strict' : 'Lax'
    const secureFlag = isProduction ? '; Secure' : ''
    const maxAge = 24 * 60 * 60 // 24 hours in seconds

    // Store session token as base64 encoded JSON
    const sessionToken = Buffer.from(JSON.stringify({
      user: authData.user,
      session: authData.session,
      timestamp: Date.now()
    })).toString('base64')

    res.setHeader('Set-Cookie', `session=${sessionToken}; HttpOnly; Path=/; SameSite=${sameSitePolicy}${secureFlag}; Max-Age=${maxAge}`)

    // Login successful
    return res.status(200).json({
      success: true,
      data: {
        user: authData.user,
        session: authData.session
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
}