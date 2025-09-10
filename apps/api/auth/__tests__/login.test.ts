import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../login'
import { VercelRequest, VercelResponse } from '@vercel/node'

// Mock the shared package
vi.mock('@simple-todo/shared', () => ({
  AuthService: {
    login: vi.fn()
  },
  loginSchema: {
    safeParse: vi.fn()
  },
  AuthUtils: {
    formatAuthError: vi.fn()
  }
}))

const { AuthService, loginSchema, AuthUtils } = await import('@simple-todo/shared')

describe('/api/auth/login', () => {
  let req: Partial<VercelRequest>
  let res: Partial<VercelResponse>
  let jsonMock: any
  let statusMock: any
  let setHeaderMock: any

  beforeEach(() => {
    jsonMock = vi.fn()
    statusMock = vi.fn().mockReturnValue({ json: jsonMock })
    setHeaderMock = vi.fn()
    
    req = {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'Password123'
      }
    }
    
    res = {
      status: statusMock,
      json: jsonMock,
      setHeader: setHeaderMock
    }

    vi.clearAllMocks()
  })

  it('should reject non-POST requests', async () => {
    req.method = 'GET'

    await handler(req as VercelRequest, res as VercelResponse)

    expect(statusMock).toHaveBeenCalledWith(405)
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: 'Method not allowed'
    })
  })

  it('should validate input data', async () => {
    ;(loginSchema.safeParse as any).mockReturnValue({
      success: false,
      error: {
        errors: [
          { path: ['email'], message: 'Invalid email' },
          { path: ['password'], message: 'Password required' }
        ]
      }
    })

    await handler(req as VercelRequest, res as VercelResponse)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid input data',
      details: [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Password required' }
      ]
    })
  })

  it('should login user successfully and set httpOnly cookies', async () => {
    const mockSession = {
      access_token: 'access_token_123',
      refresh_token: 'refresh_token_123',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      }
    }

    ;(loginSchema.safeParse as any).mockReturnValue({
      success: true,
      data: { email: 'test@example.com', password: 'Password123' }
    })
    
    ;(AuthService.login as any).mockResolvedValue({
      success: true,
      data: {
        user: mockSession.user,
        session: mockSession
      }
    })

    await handler(req as VercelRequest, res as VercelResponse)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      data: {
        user: mockSession.user,
        message: 'Login successful'
      }
    })

    // Verify httpOnly cookies were set (AC 4: Session management)
    expect(setHeaderMock).toHaveBeenCalledWith('Set-Cookie', [
      'sb-access-token=access_token_123; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600',
      'sb-refresh-token=refresh_token_123; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800'
    ])
  })

  it('should handle login errors', async () => {
    ;(loginSchema.safeParse as any).mockReturnValue({
      success: true,
      data: { email: 'test@example.com', password: 'wrongpassword' }
    })
    
    ;(AuthService.login as any).mockResolvedValue({
      success: false,
      error: 'Invalid login credentials'
    })
    
    ;(AuthUtils.formatAuthError as any).mockReturnValue('Invalid email or password')

    await handler(req as VercelRequest, res as VercelResponse)

    expect(statusMock).toHaveBeenCalledWith(401)
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid email or password'
    })
  })

  it('should handle server errors gracefully', async () => {
    ;(loginSchema.safeParse as any).mockReturnValue({
      success: true,
      data: { email: 'test@example.com', password: 'Password123' }
    })
    
    ;(AuthService.login as any).mockRejectedValue(new Error('Database error'))

    await handler(req as VercelRequest, res as VercelResponse)

    expect(statusMock).toHaveBeenCalledWith(500)
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: 'Internal server error'
    })
  })
})