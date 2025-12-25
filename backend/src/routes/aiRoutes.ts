import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { getRecommendations } from '../controllers/aiController.js'

const router = express.Router()

router.post('/recommendations', authMiddleware, getRecommendations)

export default router
