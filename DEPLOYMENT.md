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