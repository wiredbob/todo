import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import Navigation from '../Navigation'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Navigation', () => {
  it('renders navigation brand and menu items', () => {
    renderWithRouter(<Navigation />)
    
    // Check brand link
    expect(screen.getByRole('link', { name: /simple todo/i })).toBeInTheDocument()
    
    // Check navigation items
    expect(screen.getByRole('link', { name: /🏠 dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /🔐 login/i })).toBeInTheDocument()
  })

  it('has proper link destinations', () => {
    renderWithRouter(<Navigation />)
    
    expect(screen.getByRole('link', { name: /simple todo/i })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: /🏠 dashboard/i })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: /🔐 login/i })).toHaveAttribute('href', '/login')
  })

  it('shows mobile menu button on small screens', () => {
    renderWithRouter(<Navigation />)
    
    // Mobile menu button should be present
    expect(screen.getByRole('button', { name: /open main menu/i })).toBeInTheDocument()
  })

  it('mobile menu button is functional', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Navigation />)
    
    // Mobile menu button should be clickable
    const menuButton = screen.getByRole('button', { name: /open main menu/i })
    expect(menuButton).toBeInTheDocument()
    
    // Click mobile menu button - should not throw error
    await user.click(menuButton)
    
    // Button should still be there after click
    expect(menuButton).toBeInTheDocument()
  })

  it('displays icons with navigation items', () => {
    renderWithRouter(<Navigation />)
    
    // Check for icons in navigation
    expect(screen.getByText('🏠')).toBeInTheDocument()
    expect(screen.getByText('🔐')).toBeInTheDocument()
  })

  it('applies proper styling for navigation items', () => {
    renderWithRouter(<Navigation />)
    
    const dashboardLink = screen.getByRole('link', { name: /🏠 dashboard/i })
    expect(dashboardLink).toHaveClass('inline-flex', 'items-center')
  })
})