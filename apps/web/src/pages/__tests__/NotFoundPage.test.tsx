import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import NotFoundPage from '../NotFoundPage'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('NotFoundPage', () => {
  it('renders 404 error message', () => {
    renderWithRouter(<NotFoundPage />)
    
    // Check 404 heading
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
    
    // Check error message
    expect(screen.getByText(/sorry, we couldn't find the page you're looking for/i)).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    renderWithRouter(<NotFoundPage />)
    
    // Check navigation links
    expect(screen.getByRole('link', { name: /go to dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /go to login/i })).toBeInTheDocument()
  })

  it('displays available pages reference', () => {
    renderWithRouter(<NotFoundPage />)
    
    // Check available pages section
    expect(screen.getByRole('heading', { name: /available pages/i })).toBeInTheDocument()
    
    // Check page routes are displayed
    expect(screen.getByText('/')).toBeInTheDocument()
    expect(screen.getByText('/dashboard')).toBeInTheDocument()
    expect(screen.getByText('/login')).toBeInTheDocument()
  })

  it('has proper link destinations', () => {
    renderWithRouter(<NotFoundPage />)
    
    // Check link destinations
    expect(screen.getByRole('link', { name: /go to dashboard/i })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: /go to login/i })).toHaveAttribute('href', '/login')
  })
})