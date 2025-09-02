import { VercelResponse } from '@vercel/node'
import { ApiResponse } from '@simple-todo/shared'

export function sendSuccess<T>(res: VercelResponse, data: T, status = 200) {
  const response: ApiResponse<T> = {
    success: true,
    data
  }
  return res.status(status).json(response)
}

export function sendError(res: VercelResponse, message: string, status = 500) {
  const response: ApiResponse = {
    success: false,
    error: message
  }
  return res.status(status).json(response)
}