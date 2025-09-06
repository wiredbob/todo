// Security validation functions for task operations
// Addresses RLS vulnerability in parent task constraint
/**
 * Validates that a parent task exists and belongs to the same user
 * This fixes the RLS security vulnerability by ensuring proper ownership checks
 */
export async function validateParentTaskOwnership(context, userId, parentTaskId) {
    if (!parentTaskId) {
        return { valid: true }; // No parent task is valid
    }
    if (userId !== context.userId) {
        return {
            valid: false,
            error: 'User ID mismatch - potential security violation'
        };
    }
    try {
        // Query parent task using RLS-protected client
        // This ensures we can only see tasks that belong to the authenticated user
        const { data: parentTask, error } = await context.supabase
            .from('tasks')
            .select('id, user_id')
            .eq('id', parentTaskId)
            .single();
        if (error) {
            return {
                valid: false,
                error: `Parent task validation failed: ${error.message}`
            };
        }
        if (!parentTask) {
            return {
                valid: false,
                error: 'Parent task not found or access denied'
            };
        }
        if (parentTask.user_id !== userId) {
            return {
                valid: false,
                error: 'Parent task belongs to different user'
            };
        }
        return { valid: true };
    }
    catch (error) {
        return {
            valid: false,
            error: `Security validation error: ${error.message}`
        };
    }
}
/**
 * Validates task creation with proper security checks
 */
export async function validateTaskCreation(context, taskInput) {
    // Prevent self-reference (task cannot be its own parent)
    if (taskInput.parent_task_id === 'self') {
        return {
            valid: false,
            error: 'Task cannot reference itself as parent'
        };
    }
    // Validate parent task ownership
    const parentValidation = await validateParentTaskOwnership(context, taskInput.user_id, taskInput.parent_task_id || null);
    if (!parentValidation.valid) {
        return parentValidation;
    }
    return { valid: true };
}
/**
 * Validates task updates with security checks
 */
export async function validateTaskUpdate(context, taskId, updates) {
    // Prevent self-reference
    if (updates.parent_task_id === taskId) {
        return {
            valid: false,
            error: 'Task cannot reference itself as parent'
        };
    }
    // If parent_task_id or user_id is being updated, validate
    if (updates.parent_task_id !== undefined || updates.user_id !== undefined) {
        // Get current task to determine user
        const { data: currentTask, error } = await context.supabase
            .from('tasks')
            .select('user_id')
            .eq('id', taskId)
            .single();
        if (error || !currentTask) {
            return {
                valid: false,
                error: 'Task not found or access denied'
            };
        }
        const finalUserId = updates.user_id || currentTask.user_id;
        // Validate parent task ownership with final user ID
        const parentValidation = await validateParentTaskOwnership(context, finalUserId, updates.parent_task_id || null);
        if (!parentValidation.valid) {
            return parentValidation;
        }
    }
    return { valid: true };
}
/**
 * Secure task creation function that validates before inserting
 */
export async function createTaskSecurely(context, taskInput) {
    // Validate before creation
    const validation = await validateTaskCreation(context, taskInput);
    if (!validation.valid) {
        throw new Error(`Task creation blocked: ${validation.error}`);
    }
    // Proceed with creation
    const { data, error } = await context.supabase
        .from('tasks')
        .insert(taskInput)
        .select()
        .single();
    if (error) {
        throw new Error(`Task creation failed: ${error.message}`);
    }
    return data;
}
/**
 * Secure task update function that validates before updating
 */
export async function updateTaskSecurely(context, taskId, updates) {
    // Validate before update
    const validation = await validateTaskUpdate(context, taskId, updates);
    if (!validation.valid) {
        throw new Error(`Task update blocked: ${validation.error}`);
    }
    // Proceed with update
    const { data, error } = await context.supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();
    if (error) {
        throw new Error(`Task update failed: ${error.message}`);
    }
    return data;
}
