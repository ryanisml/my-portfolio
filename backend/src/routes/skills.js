import { Router } from 'express'
import { prisma } from '../db.js'
import { adminAuth } from '../middleware/auth.js'
import { parseIdParam } from '../lib/http.js'

const router = Router()
const MAX_SKILL_CARDS = 10

const normalizeGroupName = (value) => {
  const normalized = String(value || '').trim()
  return normalized.length ? normalized : null
}

const toGroupNameKey = (value) => String(value || '').trim().toLowerCase()

const loadGroupMetadata = async () => {
  const rows = await prisma.skill.findMany({
    select: { groupId: true, groupName: true },
    orderBy: [{ groupId: 'asc' }],
  })

  const groupsById = new Map()
  const groupIdByName = new Map()

  for (const row of rows) {
    if (!groupsById.has(row.groupId)) {
      groupsById.set(row.groupId, {
        groupId: row.groupId,
        groupName: normalizeGroupName(row.groupName),
      })
    }

    const normalizedName = normalizeGroupName(row.groupName)
    if (normalizedName) {
      const key = toGroupNameKey(normalizedName)
      if (!groupIdByName.has(key)) {
        groupIdByName.set(key, row.groupId)
      }
    }
  }

  let nextAvailableGroupId = 0
  while (groupsById.has(nextAvailableGroupId)) {
    nextAvailableGroupId += 1
  }

  return {
    groupsById,
    groupIdByName,
    nextAvailableGroupId,
  }
}

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

    const groupMap = new Map()

    for (const skill of skills) {
      if (!groupMap.has(skill.groupId)) {
        groupMap.set(skill.groupId, {
          groupId: skill.groupId,
          cardName: normalizeGroupName(skill.groupName) || `Track ${String(skill.groupId + 1).padStart(2, '0')}`,
          skills: [],
        })
      }

      const group = groupMap.get(skill.groupId)
      if (group) {
        if (!normalizeGroupName(group.cardName) && normalizeGroupName(skill.groupName)) {
          group.cardName = normalizeGroupName(skill.groupName)
        }
        group.skills.push(skill.skillName)
      }
    }

    const skillGroups = [...groupMap.values()]
      .sort((a, b) => a.groupId - b.groupId)
      .slice(0, MAX_SKILL_CARDS)

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

// ADMIN: Rename skill group (card name)
router.put('/admin/groups/:groupId', adminAuth, async (req, res, next) => {
  try {
    const groupId = parseIdParam(req, res, 'skill group', 'groupId')
    if (groupId === null) return

    const groupName = normalizeGroupName(req.body?.groupName)
    if (!groupName) {
      return res.status(400).json({ message: 'groupName is required.' })
    }

    const existingGroup = await prisma.skill.findFirst({
      where: { groupId },
      select: { groupId: true },
    })

    if (!existingGroup) {
      return res.status(404).json({ message: 'Skill group not found.' })
    }

    const duplicateGroup = await prisma.skill.findFirst({
      where: {
        groupId: { not: groupId },
        groupName: {
          equals: groupName,
          mode: 'insensitive',
        },
      },
      select: { groupId: true },
    })

    if (duplicateGroup) {
      return res.status(400).json({ message: 'A group with this name already exists.' })
    }

    const result = await prisma.skill.updateMany({
      where: { groupId },
      data: { groupName },
    })

    res.json({
      message: 'Skill group renamed.',
      updatedCount: result.count,
      groupId,
      groupName,
    })
  } catch (error) {
    next(error)
  }
})

// ADMIN: Delete skill group and all skills inside it
router.delete('/admin/groups/:groupId', adminAuth, async (req, res, next) => {
  try {
    const groupId = parseIdParam(req, res, 'skill group', 'groupId')
    if (groupId === null) return

    const result = await prisma.skill.deleteMany({
      where: { groupId },
    })

    if (result.count === 0) {
      return res.status(404).json({ message: 'Skill group not found.' })
    }

    res.json({
      message: 'Skill group and its skills deleted.',
      deletedCount: result.count,
      groupId,
    })
  } catch (error) {
    next(error)
  }
})

// ADMIN: Create skill
router.post('/', adminAuth, async (req, res, next) => {
  try {
    const skillName = String(req.body?.skillName || '').trim()
    const groupName = normalizeGroupName(req.body?.groupName)
    const requestedGroupId = Number(req.body?.groupId)
    const parsedSortOrder = Number(req.body?.sortOrder ?? 0)

    if (!skillName) {
      return res.status(400).json({ message: 'skillName is required.' })
    }

    const { groupsById, groupIdByName, nextAvailableGroupId } = await loadGroupMetadata()
    let targetGroupId = null

    if (groupName) {
      targetGroupId = groupIdByName.get(toGroupNameKey(groupName)) ?? null

      if (targetGroupId === null) {
        if (groupsById.size >= MAX_SKILL_CARDS) {
          return res.status(400).json({ message: `Maximum ${MAX_SKILL_CARDS} skill groups allowed.` })
        }

        targetGroupId = nextAvailableGroupId
      }
    } else if (Number.isInteger(requestedGroupId) && requestedGroupId >= 0) {
      targetGroupId = requestedGroupId

      if (!groupsById.has(targetGroupId) && groupsById.size >= MAX_SKILL_CARDS) {
        return res.status(400).json({ message: `Maximum ${MAX_SKILL_CARDS} skill groups allowed.` })
      }
    } else {
      return res.status(400).json({ message: 'groupName is required.' })
    }

    const skill = await prisma.skill.create({
      data: {
        skillName,
        groupId: targetGroupId,
        groupName,
        sortOrder: Number.isFinite(parsedSortOrder) ? parsedSortOrder : 0,
      },
    })

    if (groupName) {
      await prisma.skill.updateMany({
        where: { groupId: targetGroupId },
        data: { groupName },
      })
    }

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
    const skillName = String(req.body?.skillName || '').trim()
    const groupName = normalizeGroupName(req.body?.groupName)
    const requestedGroupId = Number(req.body?.groupId)
    const parsedSortOrder = Number(req.body?.sortOrder ?? 0)

    if (!skillName) {
      return res.status(400).json({ message: 'skillName is required.' })
    }

    const existingSkill = await prisma.skill.findUnique({
      where: { id },
      select: { groupId: true },
    })

    if (!existingSkill) {
      return res.status(404).json({ message: 'Skill not found.' })
    }

    const { groupsById, groupIdByName, nextAvailableGroupId } = await loadGroupMetadata()
    let targetGroupId = existingSkill.groupId

    if (groupName) {
      const matchedGroupId = groupIdByName.get(toGroupNameKey(groupName))
      if (matchedGroupId !== undefined) {
        targetGroupId = matchedGroupId
      } else {
        // Rename current group if this is a new name, instead of creating extra groups.
        targetGroupId = existingSkill.groupId
      }
    } else if (Number.isInteger(requestedGroupId) && requestedGroupId >= 0) {
      targetGroupId = requestedGroupId

      if (!groupsById.has(targetGroupId)) {
        if (groupsById.size >= MAX_SKILL_CARDS) {
          return res.status(400).json({ message: `Maximum ${MAX_SKILL_CARDS} skill groups allowed.` })
        }
        targetGroupId = nextAvailableGroupId
      }
    }

    const skill = await prisma.skill.update({
      where: { id },
      data: {
        skillName,
        groupId: targetGroupId,
        groupName,
        sortOrder: Number.isFinite(parsedSortOrder) ? parsedSortOrder : 0,
      },
    })

    if (groupName) {
      await prisma.skill.updateMany({
        where: { groupId: targetGroupId },
        data: { groupName },
      })
    }

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
