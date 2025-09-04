export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type BreakdownSource = 'manual' | 'rule' | 'ai';

export interface Task {
  id: string;
  user_id: string;
  parent_task_id: string | null;
  title: string;
  description?: string;
  due_date?: string;
  priority: number;
  context: string;
  task_type: string;
  status: TaskStatus;
  breakdown_source: BreakdownSource;
  task_level: number;
  sequence_order: number;
  estimated_effort?: number; // Minutes
  actual_effort?: number;    // Minutes
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  due_date?: string;
  priority?: number;
  context?: string;
  task_type?: string;
  parent_task_id?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: number;
  context?: string;
  task_type?: string;
  status?: TaskStatus;
  estimated_effort?: number;
  actual_effort?: number;
}