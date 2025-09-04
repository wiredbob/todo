#!/usr/bin/env node

// Database status check script for development
// Story 1.1a: Development Database & Test Data

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.log('Please check your .env file and ensure these variables are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

interface Task {
  id: string;
  user_id: string;
  parent_task_id?: string | null;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  context?: 'work' | 'personal';
  priority?: number;
  created_at?: string;
  updated_at?: string;
}

async function checkDatabaseStatus(): Promise<void> {
  try {
    console.log('📊 Checking database status...');
    console.log(`🔗 Connected to: ${supabaseUrl}\n`);
    
    // Test basic connectivity
    console.log('🔍 Testing database connectivity...');
    const { data: health, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Database connection failed:', healthError.message);
      process.exit(1);
    }
    
    console.log('✅ Database connection successful\n');
    
    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Error querying users:', usersError.message);
    } else {
      const typedUsers = users as User[];
      console.log(`👤 Users in database: ${typedUsers.length}`);
      typedUsers.forEach(user => {
        console.log(`   • ${user.name} (${user.email})`);
      });
    }
    
    // Check tasks table
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');
    
    if (tasksError) {
      console.error('❌ Error querying tasks:', tasksError.message);
    } else {
      const typedTasks = tasks as Task[];
      const typedUsers = users as User[];
      
      console.log(`\n📝 Tasks in database: ${typedTasks.length}`);
      
      // Group by user
      const tasksByUser = typedTasks.reduce((acc: Record<string, Task[]>, task) => {
        const userId = task.user_id;
        if (!acc[userId]) acc[userId] = [];
        acc[userId].push(task);
        return acc;
      }, {});
      
      Object.entries(tasksByUser).forEach(([userId, userTasks]) => {
        const user = typedUsers?.find(u => u.id === userId);
        const userName = user ? user.name : `Unknown User (${userId})`;
        console.log(`   • ${userName}: ${userTasks.length} tasks`);
        
        // Show task status breakdown
        const statusCounts = userTasks.reduce((acc: Record<string, number>, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        }, {});
        
        const statusSummary = Object.entries(statusCounts)
          .map(([status, count]) => `${count} ${status}`)
          .join(', ');
        
        console.log(`     Status: ${statusSummary}`);
      });
    }
    
    // Check for hierarchical tasks
    const { data: hierarchicalTasks, error: hierarchyError } = await supabase
      .from('tasks')
      .select('*')
      .not('parent_task_id', 'is', null);
    
    if (hierarchyError) {
      console.error('❌ Error querying hierarchical tasks:', hierarchyError.message);
    } else {
      console.log(`\n🌳 Hierarchical tasks: ${hierarchicalTasks?.length || 0}`);
    }
    
    console.log('\n✅ Database status check complete!');
    
  } catch (error) {
    console.error('❌ Database status check failed:', (error as Error).message);
    process.exit(1);
  }
}

checkDatabaseStatus();