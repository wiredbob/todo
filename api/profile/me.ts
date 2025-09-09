import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Parse cookies for session-based authentication
  const cookies: Record<string, string> = {}
  const cookieHeader = req.headers.cookie
  
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=')
      if (name && value) {
        cookies[name] = value
      }
    })
  }

  if (!cookies.session) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    })
  }

  let sessionData: any
  try {
    sessionData = JSON.parse(Buffer.from(cookies.session, 'base64').toString())
  } catch (parseError) {
    return res.status(401).json({
      success: false,
      error: 'Invalid session'
    })
  }

  // Create Supabase client
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error'
    })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  if (req.method === 'GET') {
    // Get user profile
    try {
      const { data: user, error } = await supabase.auth.admin.getUserById(sessionData.user.id)
      
      if (error) {
        console.error('Profile get error:', error)
        return res.status(400).json({
          success: false,
          error: error.message
        })
      }

      return res.status(200).json({
        success: true,
        data: user.user
      })

    } catch (error) {
      console.error('Profile get error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  if (req.method === 'PUT') {
    // Update user profile
    try {
      const { name, email } = req.body

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Name is required'
        })
      }

      // Update user metadata
      const updateData: any = {
        user_metadata: {
          name: name
        }
      }

      // If email is changing, include it in the update
      if (email && email !== sessionData.user.email) {
        updateData.email = email
      }

      const { data: user, error } = await supabase.auth.admin.updateUserById(
        sessionData.user.id,
        updateData
      )
      
      if (error) {
        console.error('Profile update error:', error)
        return res.status(400).json({
          success: false,
          error: error.message
        })
      }

      return res.status(200).json({
        success: true,
        data: user.user
      })

    } catch (error) {
      console.error('Profile update error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' })
}