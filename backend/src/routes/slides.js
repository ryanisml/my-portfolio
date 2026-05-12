import { Router } from 'express'
import { prisma } from '../db.js'
import { adminAuth } from '../middleware/auth.js'
import { parseIdParam } from '../lib/http.js'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const slides = await prisma.slide.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    })

    res.json(slides)
  } catch (error) {
    next(error)
  }
})

// ADMIN: Create slide
router.post('/', adminAuth, async (req, res, next) => {
  return res.status(403).json({ message: 'Slides cannot be added. Only updates are allowed.' })
})

// ADMIN: Update slide
router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const id = parseIdParam(req, res, 'slide')
    if (id === null) return
    const { slideId, eyebrow, title, description, accent, sectionClassDark, sectionClassLight, sortOrder } = req.body

    const slide = await prisma.slide.update({
      where: { id },
      data: {
        slideId,
        eyebrow,
        title,
        description,
        accent,
        sectionClassDark,
        sectionClassLight,
        sortOrder,
      },
    })

    res.json(slide)
  } catch (error) {
    next(error)
  }
})

// ADMIN: Delete slide
router.delete('/:id', adminAuth, async (req, res, next) => {
  return res.status(403).json({ message: 'Slides cannot be deleted. Only updates are allowed.' })
})

export default router
