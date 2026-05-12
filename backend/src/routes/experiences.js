import { Router } from 'express'
import { prisma } from '../db.js'
import { adminAuth } from '../middleware/auth.js'
import { parseIdParam } from '../lib/http.js'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const experiences = await prisma.workExperience.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        highlights: {
          orderBy: {
            sortOrder: 'asc',
          },
          include: {
            subHighlights: {
              orderBy: {
                sortOrder: 'asc',
              },
            },
          },
        },
      },
    })

    const transformed = experiences.map((exp) => ({
      role: exp.role,
      company: exp.company,
      period: exp.period,
      highlights: exp.highlights.map((h) => ({
        title: h.title,
        subHighlights: h.subHighlights.map((s) => s.item),
      })),
    }))

    res.json(transformed)
  } catch (error) {
    next(error)
  }
})

// ADMIN: Get all experiences with full metadata
router.get('/admin/all', adminAuth, async (_req, res, next) => {
  try {
    const experiences = await prisma.workExperience.findMany({
      include: {
        highlights: {
          include: { subHighlights: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })
    res.json(experiences)
  } catch (error) {
    next(error)
  }
})

// ADMIN: Create experience
router.post('/', adminAuth, async (req, res, next) => {
  try {
    const { role, company, period, sortOrder, highlights } = req.body

    const experience = await prisma.workExperience.create({
      data: {
        role,
        company,
        period,
        sortOrder: sortOrder || 0,
        highlights: {
          create: (highlights || []).map((h, i) => ({
            title: h.title,
            sortOrder: i,
            subHighlights: {
              create: (h.subHighlights || []).map((sub, j) => ({
                item: sub,
                sortOrder: j,
              })),
            },
          })),
        },
      },
      include: { highlights: { include: { subHighlights: true } } },
    })

    res.status(201).json(experience)
  } catch (error) {
    next(error)
  }
})

// ADMIN: Update experience
router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const id = parseIdParam(req, res, 'experience')
    if (id === null) return
    const { role, company, period, sortOrder, highlights } = req.body

    // Delete existing highlights
    await prisma.workExperienceHighlight.deleteMany({
      where: { experienceId: id },
    })

    const experience = await prisma.workExperience.update({
      where: { id },
      data: {
        role,
        company,
        period,
        sortOrder,
        highlights: {
          create: (highlights || []).map((h, i) => ({
            title: h.title,
            sortOrder: i,
            subHighlights: {
              create: (h.subHighlights || []).map((sub, j) => ({
                item: sub,
                sortOrder: j,
              })),
            },
          })),
        },
      },
      include: { highlights: { include: { subHighlights: true } } },
    })

    res.json(experience)
  } catch (error) {
    next(error)
  }
})

// ADMIN: Delete experience
router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const id = parseIdParam(req, res, 'experience')
    if (id === null) return
    await prisma.workExperience.delete({ where: { id } })
    res.json({ message: 'Experience deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
