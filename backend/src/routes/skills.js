import { Router } from 'express'
import { prisma } from '../db.js'
import { adminAuth } from '../middleware/auth.js'
import { parseIdParam } from '../lib/http.js'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [
        {
          groupId: 'asc',
        },
        {
          sortOrder: 'asc',
        },
      ],
    })

    const skillGroups = []
    const groupMap = {}

    for (const skill of skills) {
      if (!groupMap[skill.groupId]) {
        groupMap[skill.groupId] = []
        skillGroups.push(groupMap[skill.groupId])
      }
      groupMap[skill.groupId].push(skill.skillName)
    }

    res.json(skillGroups)
  } catch (error) {
    next(error)
  }
})

// ADMIN: Get all skills with metadata
router.get('/admin/all', adminAuth, async (_req, res, next) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [{ groupId: 'asc' }, { sortOrder: 'asc' }],
    })
    res.json(skills)
  } catch (error) {
    next(error)
  }
})

// ADMIN: Create skill
router.post('/', adminAuth, async (req, res, next) => {
  try {
    const { skillName, groupId, sortOrder } = req.body

    const skill = await prisma.skill.create({
      data: {
        skillName,
        groupId,
        sortOrder: sortOrder || 0,
      },
    })

    res.status(201).json(skill)
  } catch (error) {
    next(error)
  }
})

// ADMIN: Update skill
router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const id = parseIdParam(req, res, 'skill')
    if (id === null) return
    const { skillName, groupId, sortOrder } = req.body

    const skill = await prisma.skill.update({
      where: { id },
      data: { skillName, groupId, sortOrder },
    })

    res.json(skill)
  } catch (error) {
    next(error)
  }
})

// ADMIN: Delete skill
router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const id = parseIdParam(req, res, 'skill')
    if (id === null) return
    await prisma.skill.delete({ where: { id } })
    res.json({ message: 'Skill deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
