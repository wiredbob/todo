import { describe, it, expect, vi, beforeEach } from 'vitest';
import databaseHealthHandler from '../../database/health';

// Mock the supabase client
vi.mock('../../utils/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn()
      }))
    }))
  }
}));

// Mock response utilities
vi.mock('../../utils/response', () => ({
  sendSuccess: vi.fn((res, data) => res.status(200).json({ success: true, data })),
  sendError: vi.fn((res, message, status = 500) => res.status(status).json({ success: false, error: message }))
}));

// Mock VercelResponse
const mockResponse = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as any;
};

// Mock VercelRequest
const mockRequest = (method = 'GET') => ({
  method,
} as any);

describe('Database Health Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 405 for non-GET requests', async () => {
    const req = mockRequest('POST');
    const res = mockResponse();

    await databaseHealthHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Method not allowed'
    });
  });

  it('handles successful database connectivity check', async () => {
    const { supabase } = await import('../../utils/supabase');
    
    // Mock successful database queries
    const mockSelectChain = {
      limit: vi.fn().mockResolvedValue({ error: null })
    };
    const mockSelect = vi.fn().mockReturnValue(mockSelectChain);
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    supabase.from = mockFrom;

    const req = mockRequest('GET');
    const res = mockResponse();

    await databaseHealthHandler(req, res);

    expect(mockFrom).toHaveBeenCalledWith('users');
    expect(mockFrom).toHaveBeenCalledWith('tasks');
    expect(mockSelect).toHaveBeenCalledWith('id', { count: 'exact' });
  });

  it('handles database connection errors for users table', async () => {
    const { supabase } = await import('../../utils/supabase');
    
    // Mock database error for users table
    const mockSelectChain = {
      limit: vi.fn().mockResolvedValue({ error: { message: 'Connection failed' } })
    };
    const mockSelect = vi.fn().mockReturnValue(mockSelectChain);
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    supabase.from = mockFrom;

    const req = mockRequest('GET');
    const res = mockResponse();

    await databaseHealthHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
  });

  it('handles database connection errors for tasks table', async () => {
    const { supabase } = await import('../../utils/supabase');
    
    // Mock successful users query but failed tasks query
    const mockFrom = vi.fn()
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ error: null })
        })
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ error: { message: 'Tasks table error' } })
        })
      });
    
    supabase.from = mockFrom;

    const req = mockRequest('GET');
    const res = mockResponse();

    await databaseHealthHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
  });
});