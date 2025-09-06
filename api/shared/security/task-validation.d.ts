import { createClient } from '@supabase/supabase-js';
export interface TaskSecurityContext {
    userId: string;
    supabase: ReturnType<typeof createClient>;
}
export interface TaskInput {
    user_id: string;
    parent_task_id?: string | null;
    title: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    context?: 'work' | 'personal';
    priority?: number;
}
export interface TaskUpdate {
    parent_task_id?: string | null;
    user_id?: string;
    [key: string]: any;
}
/**
 * Validates that a parent task exists and belongs to the same user
 * This fixes the RLS security vulnerability by ensuring proper ownership checks
 */
export declare function validateParentTaskOwnership(context: TaskSecurityContext, userId: string, parentTaskId: string | null): Promise<{
    valid: boolean;
    error?: string;
}>;
/**
 * Validates task creation with proper security checks
 */
export declare function validateTaskCreation(context: TaskSecurityContext, taskInput: TaskInput): Promise<{
    valid: boolean;
    error?: string;
}>;
/**
 * Validates task updates with security checks
 */
export declare function validateTaskUpdate(context: TaskSecurityContext, taskId: string, updates: TaskUpdate): Promise<{
    valid: boolean;
    error?: string;
}>;
/**
 * Secure task creation function that validates before inserting
 */
export declare function createTaskSecurely(context: TaskSecurityContext, taskInput: TaskInput): Promise<any>;
/**
 * Secure task update function that validates before updating
 */
export declare function updateTaskSecurely(context: TaskSecurityContext, taskId: string, updates: TaskUpdate): Promise<any>;
