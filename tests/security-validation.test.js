// Test the application-level security validation functions
// Verifies the fix for RLS vulnerability in parent task constraint

import { createClient } from '@supabase/supabase-js';
import { 
  validateParentTaskOwnership,
  validateTaskCreation,
  validateTaskUpdate,
  createTaskSecurely,
  updateTaskSecurely
} from '../packages/shared/src/security/task-validation.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

describe('Security Validation Functions', () => {
  let testUsers = [];
  let testTasks = [];

  beforeAll(async () => {
    console.log('🔒 Setting up security validation test data...');
    
    // Create two test users
    for (let i = 1; i <= 2; i++) {
      const email = `sec-validation-${i}-${Date.now()}@example.com`;
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name: `Security Validation User ${i}` }
      });
      
      if (authError) {
        throw new Error(`Failed to create test user: ${authError.message}`);
      }
      
      testUsers.push({
        id: authData.user.id,
        email: authData.user.email,
        name: `Security Validation User ${i}`
      });
    }
    
    // Wait for triggers
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create parent tasks for each user
    for (const user of testUsers) {
      const { data: parentTask, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: `Parent Task for ${user.name}`,
          description: 'Parent task for security testing',
          status: 'pending',
          context: 'work',
          priority: 1
        })
        .select()
        .single();
        
      if (error) {
        throw new Error(`Failed to create parent task: ${error.message}`);
      }
      
      testTasks.push(parentTask);
    }
    
    console.log(`📋 Created test users: ${testUsers.length}, parent tasks: ${testTasks.length}`);
  });

  describe('validateParentTaskOwnership', () => {
    test('should allow access to own parent task', async () => {
      const context = {
        userId: testUsers[0].id,
        supabase
      };

      const result = await validateParentTaskOwnership(
        context,
        testUsers[0].id,
        testTasks[0].id
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      console.log('✅ Own parent task validation passed');
    });

    test('should reject access to other user\'s parent task', async () => {
      const context = {
        userId: testUsers[0].id,
        supabase
      };

      const result = await validateParentTaskOwnership(
        context,
        testUsers[1].id, // Different user
        testTasks[0].id  // User 0's task
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('User ID mismatch');
      console.log('✅ Cross-user parent task validation blocked:', result.error);
    });

    test('should allow null parent task', async () => {
      const context = {
        userId: testUsers[0].id,
        supabase
      };

      const result = await validateParentTaskOwnership(
        context,
        testUsers[0].id,
        null
      );

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      console.log('✅ Null parent task validation passed');
    });
  });

  describe('createTaskSecurely', () => {
    test('should create task with valid parent', async () => {
      const context = {
        userId: testUsers[0].id,
        supabase
      };

      const taskInput = {
        user_id: testUsers[0].id,
        parent_task_id: testTasks[0].id,
        title: 'Secure Subtask',
        description: 'Created via secure function',
        status: 'pending',
        context: 'work',
        priority: 1
      };

      const result = await createTaskSecurely(context, taskInput);
      
      expect(result).toBeDefined();
      expect(result.user_id).toBe(testUsers[0].id);
      expect(result.parent_task_id).toBe(testTasks[0].id);
      
      testTasks.push(result);
      console.log('✅ Secure task creation with valid parent succeeded');
    });

    test('should reject task creation with invalid parent', async () => {
      const context = {
        userId: testUsers[1].id,
        supabase
      };

      const taskInput = {
        user_id: testUsers[0].id, // User mismatch
        parent_task_id: testTasks[0].id,
        title: 'Malicious Subtask',
        description: 'Should be blocked',
        status: 'pending',
        context: 'work',
        priority: 1
      };

      await expect(createTaskSecurely(context, taskInput))
        .rejects
        .toThrow(/Task creation blocked.*User ID mismatch/);
      
      console.log('✅ Malicious task creation blocked by security validation');
    });
  });

  describe('updateTaskSecurely', () => {
    test('should prevent self-reference update', async () => {
      const context = {
        userId: testUsers[0].id,
        supabase
      };

      const taskId = testTasks[1].id; // Use existing task

      await expect(updateTaskSecurely(context, taskId, {
        parent_task_id: taskId // Self-reference
      }))
        .rejects
        .toThrow(/Task update blocked.*cannot reference itself/);

      console.log('✅ Self-reference update blocked by security validation');
    });

    test('should prevent cross-user parent update', async () => {
      // Create a task for user 1
      const { data: userTask } = await supabase
        .from('tasks')
        .insert({
          user_id: testUsers[1].id,
          title: 'User 1 Task',
          description: 'Will try to update parent',
          status: 'pending',
          context: 'personal',
          priority: 0
        })
        .select()
        .single();

      const context = {
        userId: testUsers[1].id,
        supabase
      };

      // Try to update to point to user 0's task as parent
      await expect(updateTaskSecurely(context, userTask.id, {
        parent_task_id: testTasks[0].id // User 0's task
      }))
        .rejects
        .toThrow(/Task update blocked.*different user/);

      console.log('✅ Cross-user parent update blocked by security validation');
      
      testTasks.push(userTask);
    });
  });

  afterAll(async () => {
    // Clean up test data
    console.log('🧹 Cleaning up security validation test data...');
    
    // Delete test tasks
    if (testTasks.length > 0) {
      await supabase
        .from('tasks')
        .delete()
        .in('id', testTasks.map(t => t.id));
    }
    
    // Delete auth users
    for (const user of testUsers) {
      await supabase.auth.admin.deleteUser(user.id);
    }
    
    console.log('✅ Security validation test cleanup completed');
  });
});