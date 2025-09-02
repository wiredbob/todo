export interface Task {
  id: string;
  title: string;
  completed: boolean;
  user_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}