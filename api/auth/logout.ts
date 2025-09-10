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

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    // Clear session cookie with same security settings
    const isProduction = process.env.NODE_ENV === 'production'
    const sameSitePolicy = isProduction ? 'Strict' : 'Lax'
    const secureFlag = isProduction ? '; Secure' : ''
    
    res.setHeader('Set-Cookie', `session=; HttpOnly; Path=/; SameSite=${sameSitePolicy}${secureFlag}; Max-Age=0`)

    return res.status(200).json({
      success: true,
      data: {
        message: 'Logout successful'
      }
    })

  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
}