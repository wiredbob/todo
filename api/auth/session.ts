import { VercelRequest, VercelResponse } from '@vercel/node'

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

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
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
        error: 'No session found'
      })
    }

    try {
      // Parse session data from base64 encoded cookie
      const sessionData = JSON.parse(Buffer.from(cookies.session, 'base64').toString())
      
      // Check if session is expired (24 hours)
      const sessionAge = Date.now() - (sessionData.timestamp || 0)
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      
      if (sessionAge > maxAge) {
        return res.status(401).json({
          success: false,
          error: 'Session expired'
        })
      }

      // Return session data
      return res.status(200).json({
        success: true,
        data: {
          user: sessionData.user,
          session: sessionData.session
        }
      })

    } catch (parseError) {
      console.error('Session parse error:', parseError)
      return res.status(401).json({
        success: false,
        error: 'Invalid session'
      })
    }

  } catch (error) {
    console.error('Session check error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
}