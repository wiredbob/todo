# Database Schema

Based on the PRD specifications, implementing the following schema structure:

```sql
-- Core Tables

-- User authentication and profile data
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Central task storage supporting hierarchical breakdown
tasks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  parent_task_id UUID REFERENCES tasks(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  
  -- Natural language parsing results
  due_date TIMESTAMP,
  priority INTEGER DEFAULT 0,
  context VARCHAR(50),
  task_type VARCHAR(50),
  
  -- Task breakdown tracking
  breakdown_source VARCHAR(20) DEFAULT 'manual',
  task_level INTEGER DEFAULT 0,
  sequence_order INTEGER DEFAULT 0,
  
  -- Task completion tracking
  status VARCHAR(20) DEFAULT 'pending',
  completed_at TIMESTAMP,
  
  -- Effort estimation
  estimated_effort INTEGER,
  actual_effort INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Template library for rule-based task breakdown
task_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  task_pattern VARCHAR(500),
  template_data JSONB,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User personalization and system learning
user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  preference_key VARCHAR(100) NOT NULL,
  preference_value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, preference_key)
);

-- Learning system: tracks user modifications
task_modifications (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id),
  original_breakdown JSONB,
  user_modifications JSONB,
  modification_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quality feedback system
breakdown_feedback (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id),
  breakdown_source VARCHAR(20),
  user_rating INTEGER,
  completion_rate DECIMAL(3,2),
  feedback_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_tasks_user_parent ON tasks(user_id, parent_task_id);
CREATE INDEX idx_tasks_user_context_status ON tasks(user_id, context, status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_parent_sequence ON tasks(parent_task_id, sequence_order);
```
