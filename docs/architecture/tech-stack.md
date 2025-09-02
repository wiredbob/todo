# Tech Stack

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.0+ | Type-safe frontend development | Matches PRD requirements, shared types with backend |
| Frontend Framework | React | 18+ | Component-based UI framework | PRD specified, excellent ecosystem, hooks for state management |
| UI Component Library | Headless UI + Tailwind CSS | Latest | Accessible components + utility CSS | Rapid development, accessibility compliance, matches PRD design goals |
| State Management | TanStack Query + Zustand | Latest | Server state + client state | Efficient API state management, simple client state |
| Backend Language | TypeScript | 5.0+ | Type-safe backend development | Shared types, reduced integration bugs |
| Backend Framework | Vercel Functions | Latest | Serverless API endpoints | Zero infrastructure management, automatic scaling |
| API Style | REST | - | HTTP-based API endpoints | Simple, well-understood, easy testing |
| Database | Supabase PostgreSQL | 14+ | Managed relational database | No credit card required, built-in auth, real-time |
| Cache | Supabase Edge Functions | - | Edge caching and processing | Built-in optimization, global distribution |
| File Storage | Supabase Storage | - | User file attachments | Integrated with auth, CDN included |
| Authentication | Supabase Auth | - | User management and JWT | No separate service needed, social logins |
| Frontend Testing | Vitest + React Testing Library | Latest | Unit and component testing | Fast, modern testing stack |
| Backend Testing | Vitest | Latest | Function testing | Consistent with frontend, TypeScript support |
| E2E Testing | Playwright | Latest | End-to-end testing | Reliable, cross-browser, great TypeScript support |
| Build Tool | Vite | 5+ | Fast development builds | PRD specified, excellent TypeScript support |
| Bundler | Vite | 5+ | Production bundling | Integrated with build tool, optimized output |
| IaC Tool | N/A (MVP) | - | Infrastructure as Code | Manual setup initially, Terraform for AWS migration |
| CI/CD | Vercel | - | Automated deployment | Git-based deployments, preview environments |
| Monitoring | Vercel Analytics + Supabase Metrics | - | Performance and usage tracking | Built-in monitoring, cost-effective |
| Logging | Vercel Functions Logs | - | Application logging | Integrated logging, searchable |
| CSS Framework | Tailwind CSS | 3+ | Utility-first CSS | Rapid development, consistent design system |
