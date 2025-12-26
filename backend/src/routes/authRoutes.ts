import express from 'express'
import { register, login, getMe, subscribePro } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import connectDB from '../lib/mongodb.js'

const router = express.Router()

router.use(async (req, res, next) => {
  await connectDB()
  next()
})
router.post('/register', register)
router.post('/login', login)
router.get('/me', authMiddleware, getMe)
router.post('/subscribe/pro', authMiddleware, subscribePro)

export default router
