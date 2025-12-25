import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import ENV from '../config/ENV.js'

interface AuthRequest extends Request {
  userId?: string
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { userId: string }

    req.userId = decoded.userId
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
