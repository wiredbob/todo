#!/usr/bin/env node

// Database reset script for development
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

async function resetDatabase(): Promise<void> {
  try {
    console.log('🔄 Resetting database...');
    
    // Clear all tasks first (due to foreign key constraints)
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (tasksError) {
      console.error('❌ Error clearing tasks:', tasksError.message);
    } else {
      console.log('✅ Cleared all tasks');
    }
    
    // Clear all users (except auth users which can't be deleted this way)
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (usersError) {
      console.error('❌ Error clearing users:', usersError.message);
    } else {
      console.log('✅ Cleared all users');
    }
    
    console.log('✅ Database reset complete!');
    
  } catch (error) {
    console.error('❌ Database reset failed:', (error as Error).message);
    process.exit(1);
  }
}

resetDatabase();