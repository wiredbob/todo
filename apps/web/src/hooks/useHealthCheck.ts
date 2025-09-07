import { useState, useEffect } from 'react'
import { API_ROUTES } from '@simple-todo/shared'

interface HealthStatus {
  status: 'checking' | 'connected' | 'error'
  message: string
  timestamp?: string
  version?: string
  environment?: string
}

export function useHealthCheck() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    status: 'checking',
    message: 'Checking API connection...'
  })

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(API_ROUTES.HEALTH)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const data = await response.json()
        setHealthStatus({
          status: 'connected',
          message: data.message || 'API connected successfully',
          timestamp: new Date().toISOString(),
          version: data.version || 'unknown',
          environment: data.environment || 'development'
        })
      } catch (error) {
        setHealthStatus({
          status: 'error',
          message: error instanceof Error ? error.message : 'API connection failed',
          timestamp: new Date().toISOString()
        })
      }
    }

    checkHealth()
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return healthStatus
}