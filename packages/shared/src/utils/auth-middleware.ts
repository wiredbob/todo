import { VercelRequest, VercelResponse } from '@vercel/node'
import jwt from 'jsonwebtoken'

// Middleware to verify JWT tokens from httpOnly cookies
export interface AuthenticatedRequest extends VercelRequest {
  user?: {
    id: string
    email: string
    role?: string
  }
}

export function withAuth(
  handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void> | void
) {
  return async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      // Extract token from httpOnly cookie (AC 4: Session management)
      const token = req.cookies?.['sb-access-token']
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        })
      }

      // Verify JWT token (AC 2: Secure login with JWT token generation)
      try {
        const decoded = jwt.decode(token) as any
        
        if (!decoded || typeof decoded !== 'object') {
          throw new Error('Invalid token format')
        }

        // Check if token is expired
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          return res.status(401).json({
            success: false,
            error: 'Token expired'
          })
        }

        // Add user info to request
        req.user = {
          id: decoded.sub || decoded.user_id,
          email: decoded.email,
          role: decoded.role || 'user'
        }

        // Continue to the actual handler
        return handler(req, res)
        
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        })
      }

    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
}

// Optional middleware for routes that can work with or without auth
export function withOptionalAuth(
  handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void> | void
) {
  return async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const token = req.cookies?.['sb-access-token']
      
      if (token) {
        try {
          const decoded = jwt.decode(token) as any
          
          if (decoded && typeof decoded === 'object' && decoded.exp && Date.now() < decoded.exp * 1000) {
            req.user = {
              id: decoded.sub || decoded.user_id,
              email: decoded.email,
              role: decoded.role || 'user'
            }
          }
        } catch (error) {
          // Ignore token errors in optional auth
        }
      }

      return handler(req, res)
    } catch (error) {
      return handler(req, res)
    }
  }
}