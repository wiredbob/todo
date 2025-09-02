# Testing Strategy

## Testing Pyramid

```
      E2E Tests (10%)
     /              \
    Integration Tests (20%)
   /                    \
  Frontend Unit (35%)  Backend Unit (35%)
```

## Test Organization

### Frontend Tests

```
apps/web/tests/
├── components/
│   ├── TaskInput.test.tsx
│   ├── TaskList.test.tsx
│   └── TaskHierarchy.test.tsx
├── hooks/
│   ├── useAuth.test.ts
│   └── useTasks.test.ts
├── services/
│   └── api.test.ts
└── utils/
    └── validation.test.ts
```

### Backend Tests

```
apps/api/tests/
├── auth/
│   ├── login.test.ts
│   └── register.test.ts
├── tasks/
│   ├── create.test.ts
│   └── breakdown.test.ts
└── utils/
    └── templates.test.ts
```

### E2E Tests

```
tests/e2e/
├── auth.spec.ts
├── task-creation.spec.ts
├── task-breakdown.spec.ts
└── context-switching.spec.ts
```

## Test Examples

### Frontend Component Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskInput } from '../src/components/TaskInput';

describe('TaskInput', () => {
  it('should submit task on Enter key', () => {
    const onSubmit = jest.fn();
    render(<TaskInput onSubmit={onSubmit} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Plan birthday party' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(onSubmit).toHaveBeenCalledWith('Plan birthday party');
  });
});
```

### Backend API Test

```typescript
import { createTask } from '../src/tasks/create';
import { createMocks } from 'node-mocks-http';

describe('/api/tasks/create', () => {
  it('should create task with breakdown', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        input: 'Plan team offsite for Q4',
        context: 'work'
      }
    });

    await createTask(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.parent_task.title).toBe('Plan team offsite for Q4');
    expect(data.subtasks).toHaveLength(3); // Expected breakdown size
  });
});
```

### E2E Test

```typescript
import { test, expect } from '@playwright/test';

test('user can create and complete task', async ({ page }) => {
  await page.goto('/');
  
  // Login
  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'password123');
  await page.click('[data-testid=login-button]');
  
  // Create task
  await page.fill('[data-testid=task-input]', 'Organize garage sale');
  await page.press('[data-testid=task-input]', 'Enter');
  
  // Verify task breakdown
  await expect(page.locator('[data-testid=subtask]')).toHaveCount(4);
  
  // Complete first subtask
  await page.click('[data-testid=subtask-checkbox]:first-child');
  await expect(page.locator('[data-testid=progress-bar]')).toContainText('25%');
});
```
