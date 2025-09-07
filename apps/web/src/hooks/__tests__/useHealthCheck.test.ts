import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useHealthCheck } from '../useHealthCheck'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useHealthCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns checking status initially', () => {
    const { result } = renderHook(() => useHealthCheck())
    
    expect(result.current.status).toBe('checking')
    expect(result.current.message).toBe('Checking API connection...')
    expect(result.current.timestamp).toBeUndefined()
  })

  it('calls the health API endpoint on mount', () => {
    renderHook(() => useHealthCheck())
    
    expect(mockFetch).toHaveBeenCalledWith('/api/health')
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('has the correct initial state structure', () => {
    const { result } = renderHook(() => useHealthCheck())
    
    expect(result.current).toHaveProperty('status')
    expect(result.current).toHaveProperty('message')
    expect(['checking', 'connected', 'error']).toContain(result.current.status)
  })
})