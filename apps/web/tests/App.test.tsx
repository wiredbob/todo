import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../src/App';

// Mock fetch for health checks
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('App Component', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    // Default mock for health check to prevent errors
    mockFetch.mockRejectedValue(new Error('Network error'));
  });

  it('renders with routing structure', () => {
    render(<App />);
    
    // Should show the navigation brand
    expect(screen.getByText('Simple Todo')).toBeInTheDocument();
    
    // Should render the dashboard by default (redirect from /)
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/welcome to simple todo/i)).toBeInTheDocument();
  });

  it('renders navigation with login and dashboard links', () => {
    render(<App />);
    
    // Should show navigation links
    expect(screen.getByRole('link', { name: /🏠 dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /🔐 login/i })).toBeInTheDocument();
  });

  it('renders health check component on dashboard', () => {
    render(<App />);
    
    // Health check should be rendered (checking state initially due to mock)
    expect(screen.getByText(/checking system health/i)).toBeInTheDocument();
  });

  it('renders placeholder feature cards', () => {
    render(<App />);
    
    // Should show coming soon cards for features
    expect(screen.getByText(/single task input/i)).toBeInTheDocument();
    expect(screen.getByText(/task breakdown/i)).toBeInTheDocument();
    
    // Should show multiple "coming in story" badges (there are 6 feature cards)
    const comingInElements = screen.getAllByText(/coming in story/i);
    expect(comingInElements.length).toBeGreaterThan(0);
  });
})