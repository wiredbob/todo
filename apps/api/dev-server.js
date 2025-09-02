const http = require('http');
const path = require('path');
const fs = require('fs');

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
      // Load the health handler
      delete require.cache[require.resolve('./health.ts')];
      
      // Since we can't directly require TypeScript, let's use a simple implementation
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

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});