import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PlaceholderCard from '../PlaceholderCard'

describe('PlaceholderCard', () => {
  const defaultProps = {
    title: 'Test Feature',
    description: 'This is a test feature description',
    storyReference: 'Story 1.5'
  }

  it('renders card with provided content', () => {
    render(<PlaceholderCard {...defaultProps} />)
    
    // Check title and description
    expect(screen.getByText('Test Feature')).toBeInTheDocument()
    expect(screen.getByText('This is a test feature description')).toBeInTheDocument()
    
    // Check story reference
    expect(screen.getByText('Coming in Story 1.5')).toBeInTheDocument()
  })

  it('renders default icon when none provided', () => {
    render(<PlaceholderCard {...defaultProps} />)
    
    // Check default rocket icon
    expect(screen.getByText('🚀')).toBeInTheDocument()
  })

  it('renders custom icon when provided', () => {
    render(<PlaceholderCard {...defaultProps} icon="📝" />)
    
    // Check custom icon
    expect(screen.getByText('📝')).toBeInTheDocument()
    
    // Should not have default icon
    expect(screen.queryByText('🚀')).not.toBeInTheDocument()
  })

  it('has proper styling structure', () => {
    const { container } = render(<PlaceholderCard {...defaultProps} />)
    
    // Check for main card wrapper
    expect(container.firstChild).toHaveClass('relative', 'rounded-lg', 'border')
    
    // Check for overlay (disabled state indicator)
    expect(container.querySelector('.absolute.inset-0.bg-gray-50')).toBeInTheDocument()
  })

  it('displays story badge with proper styling', () => {
    render(<PlaceholderCard {...defaultProps} />)
    
    const badge = screen.getByText('Coming in Story 1.5')
    expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'bg-blue-100')
  })
})