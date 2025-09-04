#!/usr/bin/env node

// Clean basic test data seeding for story 1.1a
// Creates 2 test users and 7 flat tasks using proper Supabase auth flow

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

interface TestUser {
  id: string;
  email: string;
  name: string;
}

interface CreatedUser {
  id: string;
  email: string;
  name: string;
}

interface TaskInput {
  user_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  context: 'work' | 'personal';
  priority: number;
}

interface SeedResult {
  userIds: string[];
  users: CreatedUser[];
}

// Consistent test user configuration for repeatable tests
const CONSISTENT_TEST_USERS: TestUser[] = [
  {
    id: '11111111-1111-1111-1111-111111111111', 
    email: 'test-user-1@example.com',
    name: 'Test User 1'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'test-user-2@example.com', 
    name: 'Test User 2'
  }
];

async function clearAllTestData(): Promise<void> {
  console.log('🧹 Clearing all test data for clean slate...');
  
  // 1. Get all existing auth users
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  console.log(`📋 Found ${existingUsers?.users?.length || 0} existing auth users`);
  
  // 2. Delete all auth users (this cascades to public.users and tasks via foreign keys)
  if (existingUsers?.users && existingUsers.users.length > 0) {
    for (const user of existingUsers.users) {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) {
        console.warn(`⚠️ Failed to delete user ${user.email}:`, error.message);
      }
    }
    console.log('🗑️ Cleared all auth users');
  }
  
  // 3. Verify cleanup (public tables should be empty due to cascades)
  const { data: remainingTasks } = await supabase.from('tasks').select('id');
  const { data: remainingUsers } = await supabase.from('users').select('id');
  
  console.log(`✅ Cleanup verified: ${remainingUsers?.length || 0} users, ${remainingTasks?.length || 0} tasks remaining`);
}

async function seedBasicData(): Promise<SeedResult> {
  console.log('🌱 Creating completely fresh test environment...');
  
  try {
    // 1. Clear all existing data first
    await clearAllTestData();
    
    // 2. Create consistent test users with predictable UUIDs
    console.log('👤 Creating consistent test auth users...');
    
    const testUsers: CreatedUser[] = [];
    for (const userData of CONSISTENT_TEST_USERS) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        user_id: userData.id, // Use consistent UUID
        email: userData.email,
        email_confirm: true,
        user_metadata: { name: userData.name }
      });
      
      if (authError) {
        console.error(`❌ Failed to create user ${userData.email}:`, authError.message);
        throw authError;
      }
      
      testUsers.push({
        id: authData.user.id,
        email: authData.user.email!,
        name: userData.name
      });
      
      console.log(`✅ Created user: ${userData.email} (${authData.user.id})`);
      console.log(`⚠️ Note: Requested ID ${userData.id} but got ${authData.user.id}`);
    }
    
    if (testUsers.length < 2) {
      throw new Error('Failed to create required test users');
    }
    
    // 2. Wait for triggers to create public.users records
    console.log('⏳ Waiting for user triggers to process...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Verify public users exist
    const { data: publicUsers } = await supabase
      .from('users')
      .select('*')
      .in('id', testUsers.map(u => u.id));
    
    console.log(`📋 Public users verified: ${publicUsers?.length || 0} of ${testUsers.length}`);
    
    if (!publicUsers || publicUsers.length !== testUsers.length) {
      throw new Error('Public users not created by trigger - database issue');
    }
    
    // 4. Create 7 basic flat tasks using ACTUAL generated user IDs
    const tasks: TaskInput[] = [
      // User 1: 3 tasks
      { user_id: testUsers[0].id, title: 'Buy groceries', description: 'Get milk, bread, eggs', status: 'pending', context: 'personal', priority: 1 },
      { user_id: testUsers[0].id, title: 'Finish report', description: 'Complete quarterly analysis', status: 'in_progress', context: 'work', priority: 2 },
      { user_id: testUsers[0].id, title: 'Call dentist', description: 'Schedule cleaning appointment', status: 'completed', context: 'personal', priority: 0 },
      
      // User 2: 4 tasks
      { user_id: testUsers[1].id, title: 'Team meeting', description: 'Prepare agenda for standup', status: 'pending', context: 'work', priority: 2 },
      { user_id: testUsers[1].id, title: 'Code review', description: 'Review pull request #123', status: 'in_progress', context: 'work', priority: 3 },
      { user_id: testUsers[1].id, title: 'Gym workout', description: 'Evening cardio session', status: 'pending', context: 'personal', priority: 1 },
      { user_id: testUsers[1].id, title: 'Pay bills', description: 'Monthly utilities and rent', status: 'cancelled', context: 'personal', priority: 0 }
    ];
    
    console.log('📝 Creating test tasks...');
    const { error: tasksError } = await supabase
      .from('tasks')
      .insert(tasks);
    
    if (tasksError) throw tasksError;
    console.log(`✅ Created ${tasks.length} test tasks`);
    
    // 5. Verify results
    const { data: verification } = await supabase
      .from('tasks')
      .select('id, title, status, user_id')
      .in('user_id', testUsers.map(u => u.id));
    
    console.log('\n📊 Verification Results:');
    console.log(`Total tasks created: ${verification?.length || 0}`);
    console.log(`User 1 tasks: ${verification?.filter(t => t.user_id === testUsers[0].id).length || 0}`);
    console.log(`User 2 tasks: ${verification?.filter(t => t.user_id === testUsers[1].id).length || 0}`);
    
    const statusCounts = (verification || []).reduce((acc: Record<string, number>, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    console.log('Status distribution:', statusCounts);
    
    console.log('\n🎯 Fresh Test User Details:');
    testUsers.forEach((user, index) => {
      console.log(`User ${index + 1}: ${user.email} (${user.id})`);
    });
    
    console.log('\n🎉 Completely fresh test environment created!');
    console.log('💡 All previous test data cleared - clean slate achieved!');
    
    // Return the actual user IDs for tests
    return {
      userIds: testUsers.map(u => u.id),
      users: testUsers
    };
    
  } catch (error) {
    console.error('❌ Seeding failed:', (error as Error).message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedBasicData();
}

export { seedBasicData, clearAllTestData, CONSISTENT_TEST_USERS };