export const API_ROUTES = {
  HEALTH: '/api/health',
  DATABASE_HEALTH: '/api/database/health',
  TASKS: '/api/tasks',
  AUTH: '/api/auth'
} as const;

export const DEFAULT_TASK_VALUES = {
  PRIORITY: 0,
  CONTEXT: 'personal',
  TASK_TYPE: 'general',
  STATUS: 'pending' as const,
  BREAKDOWN_SOURCE: 'manual' as const,
  TASK_LEVEL: 0,
  SEQUENCE_ORDER: 0
} as const;