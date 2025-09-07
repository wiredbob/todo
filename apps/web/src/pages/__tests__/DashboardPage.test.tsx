import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import DashboardPage from '../DashboardPage'

// Mock the HealthCheck component
vi.mock('../../components/HealthCheck', () => ({
  default: () => <div data-testid="health-check">Health Check Component</div>
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('DashboardPage', () => {
  it('renders dashboard header and welcome message', () => {
    renderWithRouter(<DashboardPage />)
    
    // Check main heading
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
    
    // Check welcome message
    expect(screen.getByText(/welcome to simple todo/i)).toBeInTheDocument()
    
    // Check health check component is rendered
    expect(screen.getByTestId('health-check')).toBeInTheDocument()
  })

  it('renders placeholder feature cards', () => {
    renderWithRouter(<DashboardPage />)
    
    // Check for some key placeholder cards
    expect(screen.getByText(/single task input/i)).toBeInTheDocument()
    expect(screen.getByText(/task breakdown/i)).toBeInTheDocument()
    
    // Be specific about the card title (not the welcome message)
    expect(screen.getByText('Task Management')).toBeInTheDocument()
    expect(screen.getByText(/user authentication/i)).toBeInTheDocument()
    
    // Check for story references
    expect(screen.getByText(/story 1.3/i)).toBeInTheDocument()
    expect(screen.getByText(/story 1.4/i)).toBeInTheDocument()
  })

  it('renders development status section', () => {
    renderWithRouter(<DashboardPage />)
    
    // Check development status section
    expect(screen.getByRole('heading', { name: /development status/i })).toBeInTheDocument()
    expect(screen.getByText(/story 1.1c/i)).toBeInTheDocument()
    expect(screen.getByText(/✅ completed/i)).toBeInTheDocument()
  })

  it('has navigation links', () => {
    renderWithRouter(<DashboardPage />)
    
    // Check for login link
    expect(screen.getByRole('link', { name: /login \(placeholder\)/i })).toBeInTheDocument()
  })

  it('displays completed features list', () => {
    renderWithRouter(<DashboardPage />)
    
    // Check completed features
    expect(screen.getByText(/basic routing between login and dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/responsive design with tailwind css/i)).toBeInTheDocument()
    expect(screen.getByText(/backend api health check integration/i)).toBeInTheDocument()
  })
})