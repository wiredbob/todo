// Load environment variables for testing
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env file from project root for testing
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Ensure test environment variables are set
process.env.NODE_ENV = 'test';

// Mock Supabase environment variables if not set
if (!process.env.SUPABASE_URL) {
  process.env.SUPABASE_URL = 'http://localhost:54321';
}
if (!process.env.SUPABASE_ANON_KEY) {
  process.env.SUPABASE_ANON_KEY = 'test-anon-key';
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
}