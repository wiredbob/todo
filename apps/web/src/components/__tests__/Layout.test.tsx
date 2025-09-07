import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Layout from '../Layout'

// Mock Navigation component
vi.mock('../Navigation', () => ({
  default: () => <nav data-testid="navigation">Navigation Component</nav>
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('Layout', () => {
  it('renders navigation, main content, and footer', () => {
    renderWithRouter(
      <Layout>
        <div data-testid="main-content">Test Content</div>
      </Layout>
    )
    
    // Check navigation
    expect(screen.getByTestId('navigation')).toBeInTheDocument()
    
    // Check main content
    expect(screen.getByTestId('main-content')).toBeInTheDocument()
    
    // Check footer
    expect(screen.getByText(/simple todo v1.0.0/i)).toBeInTheDocument()
    expect(screen.getByText(/story 1.1c basic ui boilerplate/i)).toBeInTheDocument()
  })

  it('displays development environment info in footer', () => {
    renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    // Check environment info
    expect(screen.getByText(/development mode/i)).toBeInTheDocument()
    expect(screen.getByText(/node.js 22.x/i)).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    const { container } = renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    // Check for main element
    expect(screen.getByRole('main')).toBeInTheDocument()
    
    // Check for footer element
    expect(container.querySelector('footer')).toBeInTheDocument()
  })

  it('applies correct CSS classes for layout', () => {
    const { container } = renderWithRouter(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    // Check root div has min-height
    expect(container.firstChild).toHaveClass('min-h-screen', 'bg-gray-50')
    
    // Check main has flex-1
    expect(screen.getByRole('main')).toHaveClass('flex-1')
  })
})