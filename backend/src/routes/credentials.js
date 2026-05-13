import { Router } from 'express'
import { prisma } from '../db.js'
import { adminAuth } from '../middleware/auth.js'
import { parseIdParam } from '../lib/http.js'

const router = Router()

const normalizeCategory = (value) => {
  const normalized = String(value || '').trim().toLowerCase()
  return normalized === 'organization' ? 'organization' : 'certification'
}

router.get('/', async (_req, res, next) => {
  try {
    const rows = await prisma.credential.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    })

    const certifications = rows
      .filter((row) => row.category === 'certification')
      .map((row) => row.title)

    const organizations = rows
      .filter((row) => row.category === 'organization')
      .map((row) => row.title)

    res.json({ certifications, organizations })
  } catch (error) {
    next(error)
  }
})

router.get('/admin/all', adminAuth, async (_req, res, next) => {
  try {
    const rows = await prisma.credential.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    })

    res.json(rows)
  } catch (error) {
    next(error)
  }
})

router.post('/', adminAuth, async (req, res, next) => {
  try {
    const title = String(req.body?.title || '').trim()
    if (!title) return res.status(400).json({ message: 'title is required.' })

    const credential = await prisma.credential.create({
      data: {
        title,
        category: normalizeCategory(req.body?.category),
        sortOrder: Number(req.body?.sortOrder ?? 0) || 0,
      },
    })

    res.status(201).json(credential)
  } catch (error) {
    next(error)
  }
})

router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const id = parseIdParam(req, res, 'credential')
    if (id === null) return

    const title = String(req.body?.title || '').trim()
    if (!title) return res.status(400).json({ message: 'title is required.' })

    const credential = await prisma.credential.update({
      where: { id },
      data: {
        title,
        category: normalizeCategory(req.body?.category),
        sortOrder: Number(req.body?.sortOrder ?? 0) || 0,
      },
    })

    res.json(credential)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const id = parseIdParam(req, res, 'credential')
    if (id === null) return

    await prisma.credential.delete({ where: { id } })
    res.json({ message: 'Credential deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
