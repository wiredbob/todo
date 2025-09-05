import { describe, it, expect, vi } from 'vitest';
import healthHandler from '../health';

// Mock VercelResponse
const mockResponse = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Parameters<typeof healthHandler>[1];
};

// Mock VercelRequest
const mockRequest = (method = 'GET') => ({
  method,
} as Parameters<typeof healthHandler>[0]);

describe('Health Endpoint', () => {
  it('returns 200 and health data for GET request', async () => {
    const req = mockRequest('GET');
    const res = mockResponse();

    await healthHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        message: 'Simple Todo API is running',
        timestamp: expect.any(String),
        status: 'healthy'
      })
    });
  });

  it('returns 405 for non-GET requests', async () => {
    const req = mockRequest('POST');
    const res = mockResponse();

    await healthHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Method not allowed'
    });
  });

  it('returns proper timestamp format', async () => {
    const req = mockRequest('GET');
    const res = mockResponse();

    await healthHandler(req, res);

    const call = (res.json as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][0] as any;
    const timestamp = call.data.timestamp;
    
    // Check if timestamp is a valid ISO string
    expect(new Date(timestamp).toISOString()).toBe(timestamp);
  });

  it('includes all required health data fields', async () => {
    const req = mockRequest('GET');
    const res = mockResponse();

    await healthHandler(req, res);

    const call = (res.json as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][0] as any;
    const data = call.data;

    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('healthy');
  });
});