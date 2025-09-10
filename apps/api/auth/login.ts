import { VercelRequest, VercelResponse } from '@vercel/node'
import { loginSchema } from '@simple-todo/shared'
import { AuthService } from '@simple-todo/shared/src/services/auth'  
import { AuthUtils } from '@simple-todo/shared/src/utils/auth'

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
    const validation = loginSchema.safeParse(req.body)
    
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

    const { email, password } = validation.data

    // Login user with Supabase Auth
    const result = await AuthService.login({ email, password })

    if (!result.success) {
      const formattedError = AuthUtils.formatAuthError(result.error || 'Login failed')
      
      return res.status(401).json({
        success: false,
        error: formattedError
      })
    }

    // Set secure httpOnly cookies for JWT tokens (AC 4: Session management)
    if (result.data?.session) {
      const { access_token, refresh_token, expires_in } = result.data.session
      
      // Set access token cookie (expires in 1 hour or as specified)
      res.setHeader('Set-Cookie', [
        `sb-access-token=${access_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${expires_in}`,
        `sb-refresh-token=${refresh_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}` // 7 days
      ])
    }

    // Success response (AC 2: Secure login with JWT token generation)
    return res.status(200).json({
      success: true,
      data: {
        user: result.data?.user,
        message: 'Login successful'
      }
    })

  } catch (error) {
    console.error('Login API error:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}