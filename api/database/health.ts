import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
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

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
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

    // Test database connectivity by counting users
    const { error: userError } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .limit(1)

    if (userError) {
      return res.status(503).json({
        success: false,
        error: `Database connection failed: ${userError.message}`
      })
    }

    // Test tasks table connectivity
    const { error: taskError } = await supabase
      .from('tasks')
      .select('id', { count: 'exact' })
      .limit(1)

    if (taskError) {
      return res.status(503).json({
        success: false,
        error: `Tasks table error: ${taskError.message}`
      })
    }

    const healthData = {
      message: 'Database connection healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        tables: {
          users: 'accessible',
          tasks: 'accessible'
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: healthData
    })
  } catch (error) {
    console.error('Database health check error:', error)
    return res.status(500).json({
      success: false,
      error: 'Database health check failed'
    })
  }
}