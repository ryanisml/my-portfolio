import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import projectsRouter from './routes/projects.js'
import slidesRouter from './routes/slides.js'
import skillsRouter from './routes/skills.js'
import experiencesRouter from './routes/experiences.js'
import socialLinksRouter from './routes/socialLinks.js'
import contactRouter from './routes/contact.js'
import aboutRouter from './routes/about.js'
import messagesRouter from './routes/messages.js'
import credentialsRouter from './routes/credentials.js'
import prisma from './lib/prisma.js'

const app = express()
const port = Number(process.env.PORT || 4000)
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(
  cors({
    origin: corsOrigin,
  }),
)
app.use(express.json())

// reCAPTCHA verification
app.post('/api/verify-captcha', async (req, res) => {
  const { token } = req.body
  if (!token) {
    return res.status(400).json({ success: false, message: 'No captcha token provided.' })
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) {
    console.error('RECAPTCHA_SECRET_KEY is not set')
    return res.status(500).json({ success: false, message: 'Captcha is not configured on the server.' })
  }

  try {
    const params = new URLSearchParams({ secret, response: token })
    const verifyRes = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      body: params,
    })
    const data = await verifyRes.json()
    if (data.success) {
      return res.json({ success: true })
    }

    const errorCodes = data['error-codes'] || []
    const hint = errorCodes.includes('invalid-input-response')
      ? 'Token is invalid/expired or site key and secret key are not a matching pair.'
      : errorCodes.includes('invalid-input-secret')
        ? 'RECAPTCHA_SECRET_KEY is invalid.'
        : errorCodes.includes('missing-input-secret')
          ? 'RECAPTCHA_SECRET_KEY is missing.'
          : null

    return res.status(400).json({
      success: false,
      message: 'Captcha verification failed. Please try again.',
      errorCodes,
      hint,
    })
  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return res.status(500).json({ success: false, message: 'Could not verify captcha. Please try again.' })
  }
})

// Health check with database verification
app.get('/health', async (_req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    console.error('Database connection error:', error.message)
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: `Database connection failed: ${error.message}`,
      hint: 'Please ensure PostgreSQL is running and DATABASE_URL is correctly configured.',
    })
  }
})

app.use('/api/projects', projectsRouter)
app.use('/api/slides', slidesRouter)
app.use('/api/skills', skillsRouter)
app.use('/api/experiences', experiencesRouter)
app.use('/api/social-links', socialLinksRouter)
app.use('/api/contact', contactRouter)
app.use('/api/about', aboutRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/credentials', credentialsRouter)

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` })
})

app.use((error, _req, res, _next) => {
  console.error(error)
  const isDev = process.env.NODE_ENV !== 'production'
  if (isDev) {
    return res.status(500).json({
      message: 'Internal server error',
      detail: error?.message || 'Unknown error',
    })
  }
  res.status(500).json({ message: 'Internal server error' })
})

app.listen(port, () => {
  console.log(`Portfolio API running on http://localhost:${port}`)
})
