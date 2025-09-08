import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../register'
import { VercelRequest, VercelResponse } from '@vercel/node'

// Mock the shared package
vi.mock('@simple-todo/shared', () => ({
  AuthService: {
    register: vi.fn()
  },
  registerSchema: {
    safeParse: vi.fn()
  },
  AuthUtils: {
    validatePasswordStrength: vi.fn(),
    formatAuthError: vi.fn()
  }
}))

const { AuthService, registerSchema, AuthUtils } = await import('@simple-todo/shared')

describe('/api/auth/register', () => {
  let req: Partial<VercelRequest>
  let res: Partial<VercelResponse>
  let jsonMock: any
  let statusMock: any

  beforeEach(() => {
    jsonMock = vi.fn()
    statusMock = vi.fn().mockReturnValue({ json: jsonMock })
    
    req = {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User'
      }
    }
    
    res = {
      status: statusMock,
      json: jsonMock
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
    ;(registerSchema.safeParse as any).mockReturnValue({
      success: false,
      error: {
        errors: [
          { path: ['email'], message: 'Invalid email' },
          { path: ['password'], message: 'Password too short' }
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
        { field: 'password', message: 'Password too short' }
      ]
    })
  })

  it('should validate password strength', async () => {
    ;(registerSchema.safeParse as any).mockReturnValue({
      success: true,
      data: { email: 'test@example.com', password: 'weak', name: 'Test' }
    })
    
    ;(AuthUtils.validatePasswordStrength as any).mockReturnValue({
      isValid: false,
      errors: ['Password must contain uppercase letter']
    })

    await handler(req as VercelRequest, res as VercelResponse)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: 'Password does not meet requirements',
      details: [{
        field: 'password',
        message: 'Password must contain uppercase letter'
      }]
    })
  })

  it('should register user successfully', async () => {
    ;(registerSchema.safeParse as any).mockReturnValue({
      success: true,
      data: { email: 'test@example.com', password: 'Password123', name: 'Test' }
    })
    
    ;(AuthUtils.validatePasswordStrength as any).mockReturnValue({
      isValid: true,
      errors: []
    })
    
    ;(AuthService.register as any).mockResolvedValue({
      success: true,
      data: {
        user: { id: '123', email: 'test@example.com', name: 'Test' }
      }
    })

    await handler(req as VercelRequest, res as VercelResponse)

    expect(statusMock).toHaveBeenCalledWith(201)
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      data: {
        user: { id: '123', email: 'test@example.com', name: 'Test' },
        message: 'Registration successful. Please check your email for confirmation.'
      }
    })
  })

  it('should handle registration errors', async () => {
    ;(registerSchema.safeParse as any).mockReturnValue({
      success: true,
      data: { email: 'test@example.com', password: 'Password123', name: 'Test' }
    })
    
    ;(AuthUtils.validatePasswordStrength as any).mockReturnValue({
      isValid: true,
      errors: []
    })
    
    ;(AuthService.register as any).mockResolvedValue({
      success: false,
      error: 'User already exists'
    })
    
    ;(AuthUtils.formatAuthError as any).mockReturnValue('An account with this email already exists')

    await handler(req as VercelRequest, res as VercelResponse)

    expect(statusMock).toHaveBeenCalledWith(400)
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: 'An account with this email already exists'
    })
  })
})