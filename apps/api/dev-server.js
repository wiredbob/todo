const http = require('http');

// Load environment variables
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

  // Route /api/health
  if (req.url === '/api/health' && req.method === 'GET') {
    const healthData = {
      message: 'Simple Todo API is running',
      timestamp: new Date().toISOString(),
      status: 'healthy'
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: healthData }));
    return;
  }

  // Route /api/auth/register
  if (req.url === '/api/auth/register' && req.method === 'POST') {
    console.log('Handling registration request...');
    
    // Collect request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const requestData = JSON.parse(body);
        console.log('Request data:', requestData);
        
        const { email, password, name } = requestData;
        
        // Basic validation
        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            error: 'Email and password are required' 
          }));
          return;
        }
        
        // Create Supabase client
        const { createClient } = require('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Server configuration error'
          }));
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Register user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || ''
            }
          }
        });

        if (authError) {
          console.error('Supabase auth error:', authError);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: authError.message
          }));
          return;
        }

        console.log('Registration successful');
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            user: authData.user,
            message: 'Registration successful. Please check your email for confirmation.'
          }
        }));
        
      } catch (err) {
        console.error('Request processing error:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
    });
    
    return;
  }

  // Route /api/auth/login
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    console.log('Handling login request...');
    
    // Collect request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const requestData = JSON.parse(body);
        const { email, password } = requestData;
        
        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            error: 'Email and password are required' 
          }));
          return;
        }
        
        // Create Supabase client  
        const { createClient } = require('@supabase/supabase-js');
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Login user
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: authError.message
          }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            user: authData.user,
            session: authData.session,
            message: 'Login successful'
          }
        }));
        
      } catch (err) {
        console.error('Login processing error:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
      }
    });
    
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