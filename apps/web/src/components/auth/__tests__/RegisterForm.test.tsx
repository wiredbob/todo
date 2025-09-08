import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import RegisterForm from '../RegisterForm'

// Mock fetch
global.fetch = vi.fn()

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders registration form with all fields', () => {
    renderWithRouter(<RegisterForm />)
    
    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
    expect(screen.getByText('Already have an account?')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    renderWithRouter(<RegisterForm />)
    
    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    }, { timeout: 2000 })

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    }, { timeout: 2000 })

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('validates password strength', async () => {
    renderWithRouter(<RegisterForm />)
    
    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'John Doe' }
    })
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'john@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'weak' }
    })

    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument()
    })
  })

  it('shows/hides password when toggle is clicked', () => {
    renderWithRouter(<RegisterForm />)
    
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
    const toggleButton = screen.getByText('Show')

    expect(passwordInput.type).toBe('password')
    
    fireEvent.click(toggleButton)
    expect(passwordInput.type).toBe('text')
    expect(screen.getByText('Hide')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Hide'))
    expect(passwordInput.type).toBe('password')
  })

  it('submits form with valid data', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ 
        success: true, 
        data: { message: 'Registration successful' } 
      })
    }
    
    ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

    renderWithRouter(<RegisterForm />)
    
    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'John Doe' }
    })
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'john@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password123' }
    })

    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123'
        }),
      })
    }, { timeout: 3000 })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: { 
          message: 'Registration successful! Please check your email for confirmation.',
          type: 'success'
        }
      })
    }, { timeout: 3000 })
  })

  it('displays error messages from server', async () => {
    const mockResponse = {
      ok: false,
      json: () => Promise.resolve({ 
        success: false, 
        error: 'Email already exists'
      })
    }
    
    ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

    renderWithRouter(<RegisterForm />)
    
    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'John Doe' }
    })
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'john@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password123' }
    })

    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})