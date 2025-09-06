import { VercelRequest, VercelResponse } from '@vercel/node'
import { sendSuccess } from '../lib/utils/response'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const healthData = {
      message: 'Simple Todo API is running',
      timestamp: new Date().toISOString(),
      status: 'healthy'
    }

    return sendSuccess(res, healthData)
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}