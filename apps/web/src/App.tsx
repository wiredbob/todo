import { useState, useEffect } from 'react'
import { API_ROUTES } from '@simple-todo/shared'

function App() {
  const [healthStatus, setHealthStatus] = useState<string>('Checking...')

  useEffect(() => {
    fetch(API_ROUTES.HEALTH)
      .then(res => res.json())
      .then(data => setHealthStatus(data.message || 'API connected'))
      .catch(() => setHealthStatus('API not available'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          Simple Todo
        </h1>
        <p className="text-gray-600 text-center mb-4">
          Hello World! The core infrastructure is ready.
        </p>
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-sm text-gray-700">
            <strong>API Status:</strong> {healthStatus}
          </p>
        </div>
      </div>
    </div>
  )
}

export default App