const http = require('http');

// Session max age in ms (7 days)
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

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

  // Route /api/auth/session - get current session
  if (req.url === '/api/auth/session' && req.method === 'GET') {
    console.log('Handling session check request...');
    console.log('Cookie header:', req.headers.cookie);
    
    try {
      // Parse cookies
      const cookies = {};
      const cookieHeader = req.headers.cookie;
      if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
          const [name, value] = cookie.trim().split('=');
          cookies[name] = value;
        });
      }
      console.log('Parsed cookies:', cookies);

      // Check for session cookie
      if (cookies.session) {
        try {
          const sessionData = JSON.parse(Buffer.from(cookies.session, 'base64').toString());
          
          // Check if session is still valid (not expired)
          const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
          if (Date.now() - sessionData.timestamp < maxAge) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              data: {
                user: sessionData.user,
                session: sessionData.session
              }
            }));
            return;
          }
        } catch (parseError) {
          console.error('Session parsing error:', parseError);
        }
      }

      // No valid session found
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: {
          user: null,
          session: null
        }
      }));
    } catch (error) {
      console.error('Session check error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
    }
    
    return;
  }

  // Route /api/auth/refresh - refresh session
  if (req.url === '/api/auth/refresh' && req.method === 'POST') {
    console.log('Handling session refresh request...');
    
    try {
      // For now, return no session (would refresh JWT in real implementation)
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'No valid session to refresh'
      }));
    } catch (error) {
      console.error('Session refresh error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
    }
    
    return;
  }

  // Route /api/auth/logout - logout user
  if (req.url === '/api/auth/logout' && req.method === 'POST') {
    console.log('Handling logout request...');
    
    try {
      // Clear session cookie with same security settings
      const isProduction = process.env.NODE_ENV === 'production'
      const sameSitePolicy = isProduction ? 'Strict' : 'Lax'
      const secureFlag = isProduction ? '; Secure' : ''
      
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Set-Cookie': `session=; HttpOnly; Path=/; SameSite=${sameSitePolicy}${secureFlag}; Max-Age=0`
      });
      res.end(JSON.stringify({
        success: true,
        data: {
          message: 'Logout successful'
        }
      }));
    } catch (error) {
      console.error('Logout error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
    }
    
    return;
  }

  // Route /api/profile/me - get current user profile
  if (req.url === '/api/profile/me' && req.method === 'GET') {
    console.log('Handling profile get request...');
    
    try {
      // Parse cookies for session-based authentication
      const cookies = {};
      const cookieHeader = req.headers.cookie;
      if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
          const [name, value] = cookie.trim().split('=');
          cookies[name] = value;
        });
      }

      // Check for valid session cookie
      if (!cookies.session) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Authentication required'
        }));
        return;
      }

      try {
        const sessionData = JSON.parse(Buffer.from(cookies.session, 'base64').toString());
        
        // Check if session is still valid (not expired)
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
        if (Date.now() - sessionData.timestamp >= maxAge) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Session expired'
          }));
          return;
        }

        // Return profile data from session
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            id: sessionData.user.id,
            email: sessionData.user.email,
            name: sessionData.user.user_metadata?.name || sessionData.user.email,
            created_at: sessionData.user.created_at,
            updated_at: sessionData.user.updated_at
          }
        }));
      } catch (parseError) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid session'
        }));
      }
    } catch (error) {
      console.error('Profile get error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
    }
    
    return;
  }

  // Route /api/profile/me - update current user profile
  if (req.url === '/api/profile/me' && req.method === 'PUT') {
    console.log('Handling profile update request...');
    
    // Collect request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const requestData = JSON.parse(body);
        
        // Parse cookies for session-based authentication
        const cookies = {};
        const cookieHeader = req.headers.cookie;
        if (cookieHeader) {
          cookieHeader.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            cookies[name] = value;
          });
        }

        // Check for valid session cookie
        if (!cookies.session) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Authentication required'
          }));
          return;
        }

        let sessionData;
        try {
          sessionData = JSON.parse(Buffer.from(cookies.session, 'base64').toString());
          
          // Check if session is still valid (not expired)
          const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
          if (Date.now() - sessionData.timestamp >= maxAge) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              error: 'Session expired'
            }));
            return;
          }
        } catch (parseError) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid session'
          }));
          return;
        }

        const { name, email } = requestData;
        
        // Basic validation
        if (!name && !email) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'At least one field (name or email) is required'
          }));
          return;
        }

        // In a real implementation, we'd update the user in Supabase
        // For now, using mock update logic with session data
        console.log('Profile update successful');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            id: sessionData.user.id,
            email: email || sessionData.user.email,
            name: name || sessionData.user.user_metadata?.name || sessionData.user.email,
            updated_at: new Date().toISOString()
          },
          message: 'Profile updated successfully'
        }));
        
      } catch (err) {
        console.error('Profile update processing error:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
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

        // Set session cookie (in real implementation, this would be a secure JWT)
        const sessionToken = Buffer.from(JSON.stringify({
          user: authData.user,
          session: authData.session,
          timestamp: Date.now()
        })).toString('base64');

        // Use Strict for production, Lax for development cross-origin
        const isProduction = process.env.NODE_ENV === 'production'
        const sameSitePolicy = isProduction ? 'Strict' : 'Lax'
        const secureFlag = isProduction ? '; Secure' : ''
        res.writeHead(200, { 
          'Content-Type': 'application/json',
          'Set-Cookie': `session=${sessionToken}; HttpOnly; Path=/; SameSite=${sameSitePolicy}${secureFlag}; Max-Age=${SESSION_MAX_AGE_MS / 1000}` // 7 days
        });
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