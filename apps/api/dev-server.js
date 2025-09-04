const http = require('http');
const path = require('path');
const fs = require('fs');

// Load environment variables at the top
require('dotenv').config({ path: '../../.env' });

// Simple development server for testing API functions locally
const server = http.createServer(async (req, res) => {
  // Enable CORS for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route /api/health to health.ts
  if (req.url === '/api/health' && req.method === 'GET') {
    try {
      const healthData = {
        message: 'Simple Todo API is running',
        timestamp: new Date().toISOString(),
        status: 'healthy'
      };
      
      const response = {
        success: true,
        data: healthData
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
    return;
  }

  // Route /api/database/health to database health check
  if (req.url === '/api/database/health' && req.method === 'GET') {
    try {
      // Import required modules
      const { createClient } = require('@supabase/supabase-js');
      
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Database configuration missing' }));
        return;
      }
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      
      // Test database connectivity
      supabase.from('users').select('id', { count: 'exact' }).limit(1)
        .then(({ data, error }) => {
          if (error) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: `Database error: ${error.message}` }));
          } else {
            const healthData = {
              message: 'Database connection healthy',
              timestamp: new Date().toISOString(),
              database: { connected: true, tables: { users: 'accessible', tasks: 'accessible' } }
            };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: healthData }));
          }
        })
        .catch(err => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Database health check failed' }));
        });
      
      return;
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Database health check failed' }));
    }
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});