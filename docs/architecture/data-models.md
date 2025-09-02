# Data Models

## User

**Purpose:** Core user entity for authentication and personalization

**Key Attributes:**
- id: UUID - Primary identifier
- email: string - Authentication and communication
- name: string - Display name
- created_at: timestamp - Account creation tracking
- preferences: JSONB - User settings and interface preferences

### TypeScript Interface

```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  preferences?: UserPreferences;
}

interface UserPreferences {
  default_context: 'work' | 'personal';
  breakdown_style: 'detailed' | 'minimal';
  interface_mode: 'professional' | 'casual';
}
```

### Relationships
- One-to-many with Tasks (user owns many tasks)
- One-to-many with TaskModifications (user makes many modifications)

## Task

**Purpose:** Central entity representing user tasks with hierarchical breakdown support

**Key Attributes:**
- id: UUID - Primary identifier
- user_id: UUID - Owner reference
- parent_task_id: UUID? - Enables task hierarchy
- title: string - Task name
- description: text? - Detailed task information
- due_date: timestamp? - Parsed deadline
- priority: integer - Inferred urgency (0=normal, 1=high, 2=urgent, -1=low)
- context: string - work/personal classification
- task_type: string - Template category (planning, research, review, etc.)
- status: string - Current state (pending, in_progress, completed)
- breakdown_source: string - Origin (manual, rule, ai)
- task_level: integer - Hierarchy depth (0=parent, 1=subtask)
- sequence_order: integer - Ordering within breakdown

### TypeScript Interface

```typescript
interface Task {
  id: string;
  user_id: string;
  parent_task_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: number;
  context: 'work' | 'personal';
  task_type: string;
  status: 'pending' | 'in_progress' | 'completed';
  breakdown_source: 'manual' | 'rule' | 'ai';
  task_level: number;
  sequence_order: number;
  estimated_effort?: number; // minutes
  actual_effort?: number; // minutes
  created_at: string;
  updated_at: string;
}
```

### Relationships
- Many-to-one with User (task belongs to user)
- Self-referencing (parent-child task hierarchy)
- One-to-many with TaskModifications (task has modification history)

## TaskTemplate

**Purpose:** Rule-based breakdown templates for intelligent task processing

**Key Attributes:**
- id: UUID - Primary identifier
- name: string - Template identifier
- task_pattern: string - Trigger keywords/phrases
- template_data: JSONB - Structured breakdown logic
- usage_count: integer - Popularity tracking
- success_rate: decimal - Completion effectiveness

### TypeScript Interface

```typescript
interface TaskTemplate {
  id: string;
  name: string;
  task_pattern: string;
  template_data: {
    subtasks: SubtaskTemplate[];
    variables: string[];
    conditions?: ConditionalLogic[];
  };
  usage_count: number;
  success_rate: number;
  created_at: string;
}

interface SubtaskTemplate {
  title: string;
  description?: string;
  estimated_effort?: number;
  prerequisites?: string[];
  sequence_order: number;
}
```

### Relationships
- Referenced by Tasks (via breakdown_source and metadata)
