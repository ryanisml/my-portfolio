import express from 'express'
import prisma from '../lib/prisma.js'
import { adminAuth } from '../middleware/auth.js'

const router = express.Router()

// Shared captcha verifier
async function verifyCaptchaToken(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) return { ok: false, error: 'reCAPTCHA is not configured on the server.' }
  if (!token) return { ok: false, error: 'Captcha token is required.' }

  const params = new URLSearchParams({ secret, response: token })
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: params,
  })
  const data = await res.json()
  return data.success ? { ok: true } : { ok: false, error: 'Captcha verification failed. Please try again.' }
}

// POST / — Public: submit a message (captcha enforced)
router.post('/', async (req, res) => {
  try {
    const { name, email, message: body, captchaToken } = req.body

    // Validate required fields first to avoid unnecessary captcha calls
    if (!name?.trim() || !email?.trim() || !body?.trim()) {
      return res.status(400).json({ message: 'Name, email, and message are required.' })
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address.' })
    }

    // Enforce captcha
    const captcha = await verifyCaptchaToken(captchaToken)
    if (!captcha.ok) {
      return res.status(400).json({ message: captcha.error })
    }

    const saved = await prisma.message.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        body: body.trim(),
      },
    })

    res.status(201).json({ success: true, id: saved.id })
  } catch (error) {
    console.error('Error saving message:', error)
    res.status(500).json({ message: 'Failed to save message.' })
  }
})

// GET /admin/all — Admin: list all messages newest first
router.get('/admin/all', adminAuth, async (_req, res) => {
  try {
    const messages = await prisma.message.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ message: 'Failed to fetch messages.' })
  }
})

// PATCH /:id/read — Admin: mark message as read
router.patch('/:id/read', adminAuth, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid message ID.' })
    }
    const msg = await prisma.message.update({ where: { id }, data: { isRead: true } })
    res.json(msg)
  } catch (error) {
    console.error('Error marking message as read:', error)
    res.status(500).json({ message: 'Failed to update message.' })
  }
})

// DELETE /:id — Admin: delete a message
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid message ID.' })
    }
    await prisma.message.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting message:', error)
    res.status(500).json({ message: 'Failed to delete message.' })
  }
})

export default router
