import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../src/App';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('App Component', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('renders the main heading', () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(<App />);
    
    expect(screen.getByText('Simple Todo')).toBeInTheDocument();
    expect(screen.getByText('Hello World! The core infrastructure is ready.')).toBeInTheDocument();
  });

  it('shows checking status initially', () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(<App />);
    
    expect(screen.getByText('API Status:')).toBeInTheDocument();
    expect(screen.getByText('Checking...')).toBeInTheDocument();
  });

  it('displays API connected status on successful health check', async () => {
    const mockResponse = { message: 'Simple Todo API is running' };
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse)
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('API Status:')).toBeInTheDocument();
      expect(screen.getByText('Simple Todo API is running')).toBeInTheDocument();
    });
  });

  it('displays API not available on failed health check', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('API Status:')).toBeInTheDocument();
      expect(screen.getByText('API not available')).toBeInTheDocument();
    });
  });

  it('handles health check response without message', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({})
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('API Status:')).toBeInTheDocument();
      expect(screen.getByText('API connected')).toBeInTheDocument();
    });
  });
});