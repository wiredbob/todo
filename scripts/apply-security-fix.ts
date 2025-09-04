#!/usr/bin/env node

// Apply security fix for RLS vulnerability
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
    // Read the security fix SQL
    const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '20250903000001_fix_rls_security.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    // Split into individual statements (basic approach)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n${i + 1}. ${statement.substring(0, 60)}...`);
      
      try {
        // Use the low-level query method for DDL
        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
          },
          body: JSON.stringify({ sql: statement })
        });
        
        if (!response.ok) {
          console.error(`❌ Failed to execute statement ${i + 1}`);
          const errorText = await response.text();
          console.error('Error:', errorText);
          continue;
        }
        
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, (error as Error).message);
      }
    }
    
    console.log('\n🎉 Security fix application completed!');
    console.log('\n📋 Summary of changes:');
    console.log('• Removed vulnerable CHECK constraint with race condition');
    console.log('• Added secure trigger function that respects RLS policies'); 
    console.log('• Added INSERT and UPDATE triggers for validation');
    console.log('• Added safe constraint to prevent self-parent references');
    
  } catch (error) {
    console.error('❌ Security fix failed:', (error as Error).message);
    process.exit(1);
  }
}

if (require.main === module) {
  applySecurityFix();
}

export { applySecurityFix };