# Coding Standards

## Critical Fullstack Rules

- **Type Sharing:** Always define types in packages/shared and import from there
- **API Calls:** Never make direct HTTP calls - use the service layer from packages/shared/services
- **Environment Variables:** Access only through config objects, never process.env directly
- **Error Handling:** All API routes must use the standard error handler and return consistent error format
- **State Updates:** Never mutate state directly - use proper state management patterns (Zustand actions)
- **Database Access:** Always use Supabase client, never raw SQL in frontend code
- **Authentication:** Always validate JWT tokens in API functions before processing requests
- **Input Validation:** Use Zod schemas for all user inputs, both frontend and backend

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `TaskInput.tsx` |
| Hooks | camelCase with 'use' | - | `useAuth.ts` |
| API Routes | - | kebab-case | `/api/tasks/create.ts` |
| Database Tables | - | snake_case | `task_templates` |
| Functions | camelCase | camelCase | `createTask`, `parseInput` |
| Constants | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `MAX_TASK_DEPTH` |
