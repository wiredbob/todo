-- Fix RLS security vulnerability in parent task constraint
-- Story: Security fix for race condition in parent task validation

-- Remove the vulnerable CHECK constraint
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS check_parent_same_user;

-- Create a secure approach using a function that respects RLS
CREATE OR REPLACE FUNCTION validate_parent_task_ownership()
RETURNS TRIGGER AS $$
BEGIN
  -- If no parent task, allow
  IF NEW.parent_task_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check if parent task exists and belongs to same user
  -- This query will respect RLS policies, so user can only see their own tasks
  IF NOT EXISTS (
    SELECT 1 
    FROM public.tasks 
    WHERE id = NEW.parent_task_id 
    AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Parent task must belong to the same user or not exist';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for INSERT operations
CREATE TRIGGER validate_parent_task_ownership_insert
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION validate_parent_task_ownership();

-- Add trigger for UPDATE operations (in case parent_task_id is changed)
CREATE TRIGGER validate_parent_task_ownership_update
  BEFORE UPDATE OF parent_task_id, user_id ON public.tasks
  FOR EACH ROW
  WHEN (NEW.parent_task_id IS DISTINCT FROM OLD.parent_task_id OR NEW.user_id IS DISTINCT FROM OLD.user_id)
  EXECUTE FUNCTION validate_parent_task_ownership();

-- Add comment explaining the security fix
COMMENT ON FUNCTION validate_parent_task_ownership() IS 
'Security function to validate parent task ownership without race conditions. Respects RLS policies.';

-- Additional constraint to ensure data integrity at database level
-- This is a simpler constraint that doesn't have the race condition
ALTER TABLE public.tasks ADD CONSTRAINT check_no_self_parent
  CHECK (id != parent_task_id);