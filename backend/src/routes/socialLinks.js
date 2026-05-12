import { Router } from 'express'
import { prisma } from '../db.js'
import { adminAuth } from '../middleware/auth.js'
import { parseIdParam } from '../lib/http.js'

const router = Router()
const PROTECTED_SOCIAL_LABELS = new Set(['linkedin', 'github'])

router.get('/', async (_req, res, next) => {
  try {
    const links = await prisma.socialLink.findMany()
    res.json(links)
  } catch (error) {
    next(error)
  }
})

// ADMIN: Create social link
router.post('/', adminAuth, async (req, res, next) => {
  try {
    const { label, href, icon } = req.body

    const normalizedLabel = String(label || '').trim()
    if (!normalizedLabel) {
      return res.status(400).json({ message: 'Label is required.' })
    }

    const existing = await prisma.socialLink.findFirst({
      where: { label: { equals: normalizedLabel, mode: 'insensitive' } },
    })

    if (existing) {
      return res.status(409).json({ message: 'Label must be unique. This label already exists.' })
    }

    const link = await prisma.socialLink.create({
      data: { label: normalizedLabel, href, icon },
    })

    res.status(201).json(link)
  } catch (error) {
    next(error)
  }
})

// ADMIN: Update social link
router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const id = parseIdParam(req, res, 'social link')
    if (id === null) return
    const { label, href, icon } = req.body
    const normalizedLabel = String(label || '').trim()

    if (!normalizedLabel) {
      return res.status(400).json({ message: 'Label is required.' })
    }

    const existing = await prisma.socialLink.findFirst({
      where: {
        label: { equals: normalizedLabel, mode: 'insensitive' },
        NOT: { id },
      },
    })

    if (existing) {
      return res.status(409).json({ message: 'Label must be unique. This label already exists.' })
    }

    const current = await prisma.socialLink.findUnique({ where: { id } })
    if (!current) {
      return res.status(404).json({ message: 'Social link not found.' })
    }

    const isLinkedIn = String(current.label || '').trim().toLowerCase() === 'linkedin'
    if (isLinkedIn) {
      const currentLabel = String(current.label || '').trim()
      const currentIcon = String(current.icon || '').trim()
      if (normalizedLabel.toLowerCase() !== currentLabel.toLowerCase()) {
        return res.status(403).json({ message: 'LinkedIn label cannot be edited.' })
      }
      if (String(icon || '').trim() !== currentIcon) {
        return res.status(403).json({ message: 'LinkedIn icon cannot be edited.' })
      }
    }

    const link = await prisma.socialLink.update({
      where: { id },
      data: { label: normalizedLabel, href, icon },
    })

    res.json(link)
  } catch (error) {
    next(error)
  }
})

// ADMIN: Delete social link
router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const id = parseIdParam(req, res, 'social link')
    if (id === null) return
    const current = await prisma.socialLink.findUnique({ where: { id } })
    if (!current) {
      return res.status(404).json({ message: 'Social link not found.' })
    }

    if (PROTECTED_SOCIAL_LABELS.has(String(current.label || '').trim().toLowerCase())) {
      return res.status(403).json({ message: `${current.label} cannot be deleted.` })
    }

    await prisma.socialLink.delete({ where: { id } })
    res.json({ message: 'Social link deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
