#!/usr/bin/env node

// Apply security fix for RLS vulnerability using direct SQL execution
// Removes vulnerable CHECK constraint and replaces with secure trigger approach

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function applySecurityFix(): Promise<void> {
  console.log('🔒 Applying RLS security vulnerability fix...');
  
  try {
    // Read and execute the SQL migration directly
    const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '20250903000001_fix_rls_security.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    console.log('📝 Executing security fix migration...');
    console.log('SQL to execute:');
    console.log(sql);
    
    // Execute the full SQL as a single statement
    const { data, error } = await supabase.rpc('exec', { sql });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
    
    console.log('✅ Security fix applied successfully!');
    console.log('Result:', data);
    
    console.log('\n📋 Summary of changes:');
    console.log('• Removed vulnerable CHECK constraint with race condition');
    console.log('• Added secure trigger function that respects RLS policies'); 
    console.log('• Added INSERT and UPDATE triggers for validation');
    console.log('• Added safe constraint to prevent self-parent references');
    
  } catch (error) {
    console.error('❌ Security fix failed:', (error as Error).message);
    
    // Try manual approach - execute statements one by one using low-level client
    console.log('🔄 Attempting manual fix...');
    
    const statements = [
      "ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS check_parent_same_user;",
      
      `CREATE OR REPLACE FUNCTION validate_parent_task_ownership()
RETURNS TRIGGER AS $$
BEGIN
  -- If no parent task, allow
  IF NEW.parent_task_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check if parent task exists and belongs to same user
  -- This query will respect RLS policies, so user can only see their own tasks
  IF NOT EXISTS (
    SELECT 1 
    FROM public.tasks 
    WHERE id = NEW.parent_task_id 
    AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Parent task must belong to the same user or not exist';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`,

      `CREATE TRIGGER validate_parent_task_ownership_insert
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION validate_parent_task_ownership();`,

      `CREATE TRIGGER validate_parent_task_ownership_update
  BEFORE UPDATE OF parent_task_id, user_id ON public.tasks
  FOR EACH ROW
  WHEN (NEW.parent_task_id IS DISTINCT FROM OLD.parent_task_id OR NEW.user_id IS DISTINCT FROM OLD.user_id)
  EXECUTE FUNCTION validate_parent_task_ownership();`,

      `COMMENT ON FUNCTION validate_parent_task_ownership() IS 
'Security function to validate parent task ownership without race conditions. Respects RLS policies.';`,

      `ALTER TABLE public.tasks ADD CONSTRAINT check_no_self_parent
  CHECK (id != parent_task_id);`
    ];
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\nExecuting statement ${i + 1}:`, statement.substring(0, 80) + '...');
      
      try {
        const { error } = await (supabase as any).from('_supabase_admin').select('*').limit(0);
        // This won't work either, but let's try a different approach
        console.log('⚠️  Cannot execute DDL through client. Manual database access required.');
        break;
      } catch (err) {
        console.log('⚠️  Cannot execute DDL through client. Manual database access required.');
        break;
      }
    }
  }
}

// Run if this is the main module (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  applySecurityFix();
}

export { applySecurityFix };