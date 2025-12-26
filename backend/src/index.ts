import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
import aiRoutes from './routes/aiRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cors())
app.use(express.json())

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/ai', aiRoutes)

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../public')))

// Handle React routing - serve index.html for all non-API routes
app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'))
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})

export default app
