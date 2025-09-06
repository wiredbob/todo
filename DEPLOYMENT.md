# Deployment Configuration

## CI/CD Architecture Decision

### Background
Initially attempted to use GitHub Actions for CI/CD with Vercel deployment via prebuilt artifacts. This approach encountered multiple technical challenges:

- **Artifact path issues**: GitHub Actions build artifacts were created in `apps/web/dist/` but deployment expected different paths
- **Module resolution failures**: Vercel couldn't resolve local imports in API functions during prebuilt deployment  
- **Function configuration complexity**: Required manual `.vc-config.json` file generation for each API endpoint
- **Node.js version conflicts**: Contradictory error messages about Node.js 18.x vs 22.x requirements

### Decision: Migrate to Vercel Native CI/CD

**Rationale:**
- Eliminates complex GitHub Actions workflow maintenance
- Leverages Vercel's native build and deployment pipeline
- Simplifies configuration and reduces points of failure
- Better integration with Vercel's serverless function architecture
- Maintains zero-cost deployment on Hobby plan

## Configuration Steps

### 1. Remove GitHub Actions
```bash
# Delete the CI/CD workflow
rm -rf .github/workflows/
```

### 2. Project Structure Changes

**API Directory Restructuring:**
- **Problem**: Vercel Hobby plan limited to 12 serverless functions
- **Initial state**: 22+ files in `/api` directory (each becomes a function)
- **Solution**: Move utilities out of `/api` to `/lib`

```bash
# Move utilities to prevent function creation
mkdir -p lib
mv api/utils lib/
mv api/shared lib/
rm api/dev-server.js api/test-db-connection.js api/package.json api/tsconfig.json api/.eslintrc.json
```

**Final API structure (2 functions only):**
```
api/
├── health.ts                    # Basic health check endpoint
└── database/health.ts          # Database connectivity check

lib/
├── utils/
│   ├── response.ts             # API response utilities
│   └── supabase.ts            # Database client
└── shared/                     # Shared type definitions
```

### 3. Vercel Configuration

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@5.3.17"
    }
  }
}
```

**package.json engines:**
```json
{
  "engines": {
    "node": "22.x",
    "npm": ">=9.0.0"
  }
}
```

**.nvmrc:**
```
22
```

### 4. Vercel Project Settings

**Project Root Directory:**
- Changed from `apps/web` to `.` (project root)
- Required to support both frontend (`dist/`) and API (`api/`) deployment

**Node.js Version:**
- Set to `22.x` in Project Settings → General → Node.js Version
- Ensures compatibility with `@vercel/node@5.3.17` runtime

### 5. Environment Variables

**Required Variables (set in Vercel Dashboard → Settings → Environment Variables):**
```
SUPABASE_URL=[your-supabase-project-url]
SUPABASE_SERVICE_ROLE_KEY=[your-supabase-service-role-key]
```

**Configuration:**
- Set for Production environment
- Available to serverless functions at runtime
- Required for database connectivity in `/api/database/health`

### 6. Import Path Updates

Updated API endpoints to reference utilities in new location:
```typescript
// Before
import { sendSuccess } from './utils/response'

// After  
import { sendSuccess } from '../lib/utils/response'
```

## Key Technical Constraints

### Vercel Hobby Plan Limitations
- **Maximum 12 serverless functions** per deployment
- **Solution**: Architectural restructuring to minimize function count
- **Result**: 2 functions (health endpoints) vs 22+ initially

### Node.js Runtime Compatibility
- **Vercel requirement**: Node.js 22.x with `@vercel/node@5.3.17`
- **Configuration**: Consistent version specification across package.json, .nvmrc, and Vercel settings

## Deployment Process

1. **Automatic Deployment**: Triggered by git push to main branch
2. **Build Process**: 
   - Frontend: `npm run build` → `dist/` directory
   - API: TypeScript compilation of `api/**/*.ts` → serverless functions
3. **Environment**: Production environment with configured variables

## Verification

**Frontend Health Check:**
- URL: `https://your-domain.vercel.app/`
- Expected: "API Status: Healthy" instead of "API not available"

**API Endpoints:**
- `/api/health` - Basic service health
- `/api/database/health` - Database connectivity verification

## Benefits Achieved

- ✅ **Zero-cost deployment** on Vercel Hobby plan
- ✅ **Simplified CI/CD pipeline** with native Vercel integration  
- ✅ **Automatic deployments** on git push
- ✅ **Proper environment variable management**
- ✅ **Node.js 22.x support** with latest runtime
- ✅ **Monorepo support** (frontend + API in single project)
- ✅ **Function count optimization** for free tier compliance

## Database Security Fixes - Manual Application

### Background
Some database security fixes require DDL (Data Definition Language) operations that cannot be executed programmatically through Supabase client libraries due to security restrictions. These must be applied manually via the Supabase dashboard.

### When Manual Application is Required

**DDL Operations that require manual execution:**
- `ALTER TABLE` statements (adding/dropping constraints, columns)
- `CREATE/DROP TRIGGER` operations
- `CREATE/DROP FUNCTION` (stored procedures)
- Database schema modifications

**Scripts that cannot execute automatically:**
- Any script using `ALTER TABLE`, `CREATE TRIGGER`, `CREATE FUNCTION`
- Migration files containing DDL statements
- Security fixes involving database structure changes

### Step-by-Step Manual Application Process

#### 1. Access Supabase SQL Editor
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query** to create a new SQL script

#### 2. Verify Current State (Before)
Before applying any security fix, check the current database state:

```sql
-- Check existing constraints
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.tasks'::regclass;

-- Check existing triggers
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'tasks' 
AND trigger_schema = 'public';

-- Check existing functions
SELECT proname, prosrc
FROM pg_proc 
WHERE proname LIKE '%security%' OR proname LIKE '%validation%';
```

#### 3. Apply Security Fix SQL Statements
Copy and paste the SQL statements from the migration file into the SQL Editor. Execute them **one by one** in the correct order:

**Example: RLS Security Fix (Story 1.7)**
```sql
-- 1. Remove vulnerable constraint
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS check_parent_same_user;

-- 2. Create secure trigger function  
CREATE OR REPLACE FUNCTION validate_parent_task_ownership()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_task_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE id = NEW.parent_task_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Parent task must belong to the same user or not exist';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Add INSERT trigger (CRITICAL - prevents cross-user task creation)
CREATE TRIGGER validate_parent_task_ownership_insert
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION validate_parent_task_ownership();

-- 4. Add UPDATE trigger (CRITICAL - prevents cross-user parent updates)
CREATE TRIGGER validate_parent_task_ownership_update
  BEFORE UPDATE OF parent_task_id, user_id ON public.tasks
  FOR EACH ROW
  WHEN (NEW.parent_task_id IS DISTINCT FROM OLD.parent_task_id OR NEW.user_id IS DISTINCT FROM OLD.user_id)
  EXECUTE FUNCTION validate_parent_task_ownership();

-- 5. Add documentation
COMMENT ON FUNCTION validate_parent_task_ownership() IS 
'Security function to validate parent task ownership without race conditions. Respects RLS policies.';

-- 6. Add safe constraint
ALTER TABLE public.tasks ADD CONSTRAINT check_no_self_parent
  CHECK (id != parent_task_id);
```

#### 4. Verify Application (After)
Run verification queries to confirm the fix was applied correctly:

```sql
-- Verify old constraint is removed
SELECT COUNT(*) FROM pg_constraint 
WHERE conrelid = 'public.tasks'::regclass 
AND conname = 'check_parent_same_user';
-- Should return 0

-- Verify new triggers exist (MUST return 2 rows - INSERT and UPDATE triggers)
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'tasks' 
AND trigger_name LIKE '%validate_parent_task_ownership%';
-- Should return 2 rows:
-- validate_parent_task_ownership_insert
-- validate_parent_task_ownership_update

-- Verify new constraint exists
SELECT COUNT(*) FROM pg_constraint 
WHERE conrelid = 'public.tasks'::regclass 
AND conname = 'check_no_self_parent';
-- Should return 1

-- Verify function exists
SELECT COUNT(*) FROM pg_proc 
WHERE proname = 'validate_parent_task_ownership';
-- Should return 1
```

#### 5. Test Security Fix Functionality
Create test queries to verify the security fix works as expected:

```sql
-- Test 1: Verify self-parent prevention (should fail)
-- This should raise an exception
INSERT INTO public.tasks (id, user_id, parent_task_id, title, description) 
VALUES (gen_random_uuid(), 'test-user-id', gen_random_uuid(), 'Test Task', 'Test');

-- Test 2: Verify cross-user parent prevention 
-- (Cannot easily test without multiple user contexts in SQL editor)
```

### Troubleshooting Manual Application

#### Common Issues and Solutions

**1. Permission Denied Errors**
- Ensure you're using the **service role key** or **admin access**
- Some operations require elevated privileges

**2. Constraint Already Exists**
- Use `IF NOT EXISTS` clauses where possible
- Check current state before applying changes

**3. Trigger Creation Failures**
- Ensure the trigger function exists before creating triggers
- Check for syntax errors in function definitions

**4. Function Security Context**
- Use `SECURITY DEFINER` for functions that need elevated privileges
- Be cautious with `SECURITY INVOKER` functions

#### Verification Checklist

After applying any database security fix:

- [ ] Old vulnerable constraints/triggers removed
- [ ] New security functions deployed  
- [ ] **BOTH INSERT and UPDATE triggers active** (critical - many fixes require both)
- [ ] Verification queries return expected results (triggers count = 2)
- [ ] Application functionality tested (no breaking changes)
- [ ] **Security tests passing** - run regression tests to verify fix
- [ ] Security vulnerability confirmed fixed

### Documentation Requirements

When manually applying database fixes:

1. **Record the exact SQL executed** in the story/issue
2. **Document verification results** (before/after queries)  
3. **Note any issues encountered** during application
4. **Update story status** to reflect completion
5. **Confirm application functionality** remains intact

This manual process ensures database security fixes are applied safely while maintaining system integrity.