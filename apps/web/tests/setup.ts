import '@testing-library/jest-dom';

// Mock environment variables for testing
process.env.VITE_SUPABASE_URL = 'http://localhost:54321';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';