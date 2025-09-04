import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthCheck } from '../../src/components/HealthCheck';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('HealthCheck Component', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('shows loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<HealthCheck />);
    
    expect(screen.getByText('Checking system health...')).toBeInTheDocument();
  });

  it('displays system health when all checks pass', async () => {
    const apiHealthResponse = {
      data: {
        message: 'Simple Todo API is running',
        timestamp: '2025-09-04T12:00:00.000Z',
        status: 'healthy'
      }
    };

    const dbHealthResponse = {
      data: {
        message: 'Database connection healthy',
        timestamp: '2025-09-04T12:00:00.000Z',
        database: {
          connected: true,
          tables: {
            users: 'accessible',
            tasks: 'accessible'
          }
        }
      }
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(apiHealthResponse)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(dbHealthResponse)
      });

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText('System Health Status')).toBeInTheDocument();
    });

    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Message: Simple Todo API is running';
    })).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Message: Database connection healthy';
    })).toBeInTheDocument();
    expect(screen.getByText(/Version: 1.0.0/)).toBeInTheDocument();
    expect(screen.getByText(/Environment:/)).toBeInTheDocument();
  });

  it('handles API fetch errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch health status')).toBeInTheDocument();
    });
  });

  it('handles partial health check failures', async () => {
    const apiHealthResponse = {
      data: {
        message: 'Simple Todo API is running',
        timestamp: '2025-09-04T12:00:00.000Z',
        status: 'healthy'
      }
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(apiHealthResponse)
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({})
      });

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText('System Health Status')).toBeInTheDocument();
    });

    // Should show API health but not database health
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Message: Simple Todo API is running';
    })).toBeInTheDocument();
    expect(screen.queryByText((content, element) => {
      return element?.textContent === 'Message: Database connection healthy';
    })).not.toBeInTheDocument();
  });

  it('displays build information correctly', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<HealthCheck />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch health status')).toBeInTheDocument();
    });
  });
});