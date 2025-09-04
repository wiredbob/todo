-- Row Level Security policies for Simple Todo application
-- Story 1.1a: Development Database & Test Data

-- Enable Row Level Security on tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can only see and modify their own record
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users are created via trigger, so no explicit INSERT policy needed
-- Prevent direct user deletion
CREATE POLICY "Users cannot delete themselves" ON public.users
  FOR DELETE USING (false);

-- Tasks table policies
-- Users can only access their own tasks
CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Additional constraint to ensure parent tasks belong to same user
-- This is enforced at the application level and via check constraints
ALTER TABLE public.tasks ADD CONSTRAINT check_parent_same_user
  CHECK (
    parent_task_id IS NULL OR 
    user_id = (SELECT user_id FROM public.tasks WHERE id = parent_task_id)
  ) DEFERRABLE INITIALLY DEFERRED;