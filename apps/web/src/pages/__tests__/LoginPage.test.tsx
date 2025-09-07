import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import LoginPage from '../LoginPage'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('LoginPage', () => {
  it('renders login form with placeholder content', () => {
    renderWithRouter(<LoginPage />)
    
    // Check main heading
    expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument()
    
    // Check form fields are disabled and have placeholder text
    expect(screen.getByLabelText(/email address/i)).toBeDisabled()
    expect(screen.getByLabelText(/password/i)).toBeDisabled()
    expect(screen.getAllByPlaceholderText(/coming in story 1.2 - authentication/i)).toHaveLength(2)
    
    // Check submit button is disabled
    expect(screen.getByRole('button', { name: /sign in \(coming soon\)/i })).toBeDisabled()
    
    // Check placeholder notice
    expect(screen.getByText(/placeholder login/i)).toBeInTheDocument()
    expect(screen.getByText(/story 1.2 - authentication/i)).toBeInTheDocument()
    
    // Check dashboard link
    expect(screen.getByRole('link', { name: /go to dashboard/i })).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    renderWithRouter(<LoginPage />)
    
    // Form should have proper labels
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password')
    
    // Button should have proper type
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })
})