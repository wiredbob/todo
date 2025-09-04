import React, { useState, useEffect } from 'react';
import { API_ROUTES } from '@simple-todo/shared';

interface HealthData {
  message: string;
  timestamp: string;
  status: string;
  buildInfo?: {
    version: string;
    buildTime: string;
    environment: string;
  };
}

interface DatabaseHealthData {
  message: string;
  timestamp: string;
  database: {
    connected: boolean;
    tables: {
      users: string;
      tasks: string;
    };
  };
}

export const HealthCheck: React.FC = () => {
  const [apiHealth, setApiHealth] = useState<HealthData | null>(null);
  const [dbHealth, setDbHealth] = useState<DatabaseHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check API health
        const apiResponse = await fetch(API_ROUTES.HEALTH);
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          setApiHealth(apiData.data);
        }

        // Check database health
        const dbResponse = await fetch('/api/database/health');
        if (dbResponse.ok) {
          const dbData = await dbResponse.json();
          setDbHealth(dbData.data);
        }
      } catch (err) {
        setError('Failed to fetch health status');
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  const getCurrentBuildInfo = () => ({
    version: '1.0.0',
    buildTime: new Date().toISOString(),
    environment: import.meta.env.MODE || 'development'
  });

  if (loading) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Checking system health...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  const buildInfo = getCurrentBuildInfo();

  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold text-green-900 mb-2">System Health Status</h3>
        
        {/* Frontend Health */}
        <div className="mb-4">
          <h4 className="font-medium text-green-800">Frontend</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p>Version: {buildInfo.version}</p>
            <p>Environment: {buildInfo.environment}</p>
            <p>Build Time: {buildInfo.buildTime}</p>
            <p>Status: ✅ Healthy</p>
          </div>
        </div>

        {/* API Health */}
        {apiHealth && (
          <div className="mb-4">
            <h4 className="font-medium text-green-800">API</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p>Message: {apiHealth.message}</p>
              <p>Status: ✅ {apiHealth.status}</p>
              <p>Last Check: {new Date(apiHealth.timestamp).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Database Health */}
        {dbHealth && (
          <div className="mb-4">
            <h4 className="font-medium text-green-800">Database</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p>Message: {dbHealth.message}</p>
              <p>Connection: ✅ {dbHealth.database.connected ? 'Connected' : 'Disconnected'}</p>
              <p>Users Table: ✅ {dbHealth.database.tables.users}</p>
              <p>Tasks Table: ✅ {dbHealth.database.tables.tasks}</p>
              <p>Last Check: {new Date(dbHealth.timestamp).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};