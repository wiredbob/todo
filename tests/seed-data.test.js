// Test suite for basic seed data validation
// Story 1.1a: Ensures test data is loaded correctly

import { createClient } from '@supabase/supabase-js';
import { seedBasicData } from '../scripts/seed-basic-data.js';

// Test configuration
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

describe('Basic Seed Data Tests', () => {
  let testUserIds = [];
  let testUsers = [];
  
  beforeAll(async () => {
    // Run seed data creation (completely clears and recreates)
    console.log('🌱 Setting up completely fresh test data...');
    const seedResult = await seedBasicData();
    testUserIds = seedResult.userIds;
    testUsers = seedResult.users;
    console.log(`📋 Using fresh test user IDs: ${testUserIds.join(', ')}`);
  });

  describe('User Data Validation', () => {
    test('should have exactly 2 test users', async () => {
      expect(testUserIds.length).toBe(2);
    });

    test('should have valid user records in both auth and public tables', async () => {
      // Check public.users
      const { data: publicUsers } = await supabase
        .from('users')
        .select('*')
        .in('id', testUserIds);
      
      expect(publicUsers).toHaveLength(2);
      
      // Find users by ID to ensure correct matching
      const user1 = publicUsers.find(u => u.id === testUsers[0].id);
      const user2 = publicUsers.find(u => u.id === testUsers[1].id);
      
      expect(user1).toBeDefined();
      expect(user2).toBeDefined();
      expect(user1.email).toBe('test-user-1@example.com');
      expect(user2.email).toBe('test-user-2@example.com');
      expect(user1.name).toBe('Test User 1');
      expect(user2.name).toBe('Test User 2');
    });

    test('should have proper timestamps', async () => {
      const { data: users } = await supabase
        .from('users')
        .select('created_at, updated_at')
        .in('id', testUserIds);

      users.forEach(user => {
        expect(new Date(user.created_at)).toBeInstanceOf(Date);
        expect(new Date(user.updated_at)).toBeInstanceOf(Date);
        expect(user.created_at).toBe(user.updated_at); // New users
      });
    });
  });

  describe('Task Data Validation', () => {
    test('should have exactly 7 tasks total', async () => {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .in('user_id', testUserIds);

      expect(tasks).toHaveLength(7);
    });

    test('should have correct task distribution per user', async () => {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('user_id')
        .in('user_id', testUserIds);

      const user1Tasks = tasks.filter(t => t.user_id === testUsers[0].id).length;
      const user2Tasks = tasks.filter(t => t.user_id === testUsers[1].id).length;

      expect(user1Tasks).toBe(3);
      expect(user2Tasks).toBe(4);
    });

    test('should have all required task statuses represented', async () => {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('status')
        .in('user_id', testUserIds);

      const statuses = tasks.map(t => t.status);
      expect(statuses).toContain('pending');
      expect(statuses).toContain('in_progress');
      expect(statuses).toContain('completed');
      expect(statuses).toContain('cancelled');

      // Verify exact counts
      const statusCounts = statuses.reduce((acc, status) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      expect(statusCounts.pending).toBe(3);
      expect(statusCounts.in_progress).toBe(2);
      expect(statusCounts.completed).toBe(1);
      expect(statusCounts.cancelled).toBe(1);
    });

    test('should have valid priority values', async () => {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('priority')
        .in('user_id', testUserIds);

      tasks.forEach(task => {
        expect(task.priority).toBeGreaterThanOrEqual(0);
        expect(task.priority).toBeLessThanOrEqual(3);
        expect(Number.isInteger(task.priority)).toBe(true);
      });
    });

    test('should have both work and personal contexts', async () => {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('context')
        .in('user_id', testUserIds);

      const contexts = tasks.map(t => t.context);
      expect(contexts).toContain('work');
      expect(contexts).toContain('personal');
    });

    test('should have valid task fields', async () => {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .in('user_id', testUserIds);

      tasks.forEach(task => {
        // Required fields
        expect(task.id).toBeDefined();
        expect(task.user_id).toBeDefined();
        expect(task.title).toBeDefined();
        expect(task.title.length).toBeGreaterThan(0);
        expect(task.status).toBeDefined();
        expect(task.context).toBeDefined();
        expect(task.priority).toBeDefined();
        
        // Timestamps
        expect(new Date(task.created_at)).toBeInstanceOf(Date);
        expect(new Date(task.updated_at)).toBeInstanceOf(Date);
        
        // No hierarchical data (flat tasks only)
        expect(task.parent_task_id).toBeNull();
        expect(task.task_level).toBe(0);
      });
    });
  });

  describe('Database Constraints and Relationships', () => {
    test('should have proper foreign key relationships', async () => {
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          id,
          user_id,
          users!inner(id, email)
        `)
        .in('user_id', testUserIds);

      expect(tasks).toHaveLength(7);
      tasks.forEach(task => {
        expect(task.users.id).toBe(task.user_id);
        expect(['test-user-1@example.com', 'test-user-2@example.com']).toContain(task.users.email);
      });
    });

    test('should reject invalid status values', async () => {
      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: testUserIds[0],
          title: 'Invalid status test',
          status: 'invalid_status',
          context: 'personal',
          priority: 1
        });

      expect(error).toBeDefined();
      expect(error.message).toContain('status');
    });

    test('should enforce required fields', async () => {
      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: testUserIds[0],
          // Missing required title
          status: 'pending',
          context: 'personal',
          priority: 1
        });

      expect(error).toBeDefined();
      expect(error.message).toContain('title');
    });
  });

  describe('Data Consistency', () => {
    test('should have no duplicate task titles within same user', async () => {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('user_id, title')
        .in('user_id', testUserIds);

      // Group by user
      const tasksByUser = tasks.reduce((acc, task) => {
        if (!acc[task.user_id]) acc[task.user_id] = [];
        acc[task.user_id].push(task.title);
        return acc;
      }, {});

      Object.values(tasksByUser).forEach(userTasks => {
        const uniqueTitles = new Set(userTasks);
        expect(uniqueTitles.size).toBe(userTasks.length);
      });
    });

    test('should have reasonable description lengths', async () => {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('description')
        .in('user_id', testUserIds);

      tasks.forEach(task => {
        if (task.description) {
          expect(task.description.length).toBeGreaterThan(5);
          expect(task.description.length).toBeLessThan(200);
        }
      });
    });
  });

  afterAll(async () => {
    // Test data will be cleaned up by the next test run
    // The seed script clears everything before creating fresh data
    console.log('💡 Test data cleanup handled by seed script next run');

    console.log('✅ Test cleanup completed');
  });
});