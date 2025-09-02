# Development Workflow

## Local Development Setup

### Prerequisites

```bash
# Install Node.js 18+ and npm
node --version  # Should be 18+
npm --version

# Install Supabase CLI
npm install -g supabase

# Verify installations
supabase --version
```

### Initial Setup

```bash
# Clone and setup project
git clone <repository-url>
cd simple-todo
npm install

# Setup Supabase project
supabase init
supabase start  # Starts local Supabase instance

# Setup environment variables
cp .env.example .env.local
# Fill in Supabase project URL and anon key

# Setup database schema
supabase db reset  # Creates tables from migrations
```

### Development Commands

```bash
# Start all services
npm run dev

# Start frontend only
npm run dev:web

# Start local Supabase
npm run dev:db

# Run tests
npm run test          # All tests
npm run test:web      # Frontend tests
npm run test:api      # API function tests
npm run test:e2e      # End-to-end tests
```

## Environment Configuration

### Required Environment Variables

```bash
# Frontend (.env.local)
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_URL=http://localhost:5173

# Backend (Vercel Functions)
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=postgresql://postgres:password@localhost:54321/postgres

# Shared
NODE_ENV=development
```
