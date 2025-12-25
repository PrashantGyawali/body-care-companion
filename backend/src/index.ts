import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/ai', aiRoutes)

app.get('/', (_req, res) => res.send('Hello Express!'))

export default app
