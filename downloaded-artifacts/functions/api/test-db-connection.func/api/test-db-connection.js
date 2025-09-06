// Quick database connection test for development
// Story 1.1a: Development Database & Test Data

const { createClient } = require('@supabase/supabase-js');

// Mock environment for testing (replace with actual values)
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    console.log('🧪 Testing database connection...');
    console.log(`📍 URL: ${supabaseUrl}`);
    
    // Test users table access
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(3);
    
    if (usersError) {
      console.error('❌ Users table test failed:', usersError.message);
      console.log('💡 This is expected if database is not set up yet');
    } else {
      console.log(`✅ Users table accessible (${users.length} records found)`);
    }
    
    // Test tasks table access
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, status')
      .limit(3);
    
    if (tasksError) {
      console.error('❌ Tasks table test failed:', tasksError.message);
      console.log('💡 This is expected if database is not set up yet');
    } else {
      console.log(`✅ Tasks table accessible (${tasks.length} records found)`);
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n🔧 To fix this:');
    console.log('1. Set up a Supabase project at https://supabase.com');
    console.log('2. Run the migrations in supabase/migrations/');
    console.log('3. Update your .env file with the correct SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    console.log('4. Run the seed script: npm run db:seed');
  }
}

testConnection();