import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../lib/utils/supabase'
import { sendSuccess, sendError } from '../../lib/utils/response'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Test database connectivity by counting users
    const { error: userError } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .limit(1)

    if (userError) {
      return sendError(res, `Database connection failed: ${userError.message}`, 503)
    }

    // Test tasks table connectivity
    const { error: taskError } = await supabase
      .from('tasks')
      .select('id', { count: 'exact' })
      .limit(1)

    if (taskError) {
      return sendError(res, `Tasks table error: ${taskError.message}`, 503)
    }

    const healthData = {
      message: 'Database connection healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        tables: {
          users: 'accessible',
          tasks: 'accessible'
        }
      }
    }

    return sendSuccess(res, healthData)
  } catch (error) {
    return sendError(res, 'Database health check failed', 500)
  }
}