import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import LoginPage from '../LoginPage'
import { AuthProvider } from '../../contexts/AuthContext'

// Mock AuthProvider for tests
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <MockAuthProvider>
        {component}
      </MockAuthProvider>
    </BrowserRouter>
  )
}

describe('LoginPage', () => {
  it('renders login form with authentication functionality', () => {
    renderWithProviders(<LoginPage />)
    
    // Check main heading
    expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument()
    
    // Check form fields are enabled (real auth form)
    expect(screen.getByLabelText(/email address/i)).not.toBeDisabled()
    expect(screen.getByLabelText(/password/i)).not.toBeDisabled()
    
    // Check form fields have proper placeholders
    expect(screen.getByPlaceholderText(/enter your email address/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument()
    
    // Check submit button is enabled
    expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled()
    
    // Check register link
    expect(screen.getByRole('link', { name: /create account/i })).toBeInTheDocument()
    
    // Check security notice
    expect(screen.getByText(/secure login/i)).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    renderWithProviders(<LoginPage />)
    
    // Form should have proper labels
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password')
    
    // Button should have proper type
    expect(screen.getByRole('button', { name: /sign in/i })).toHaveAttribute('type', 'submit')
  })
})