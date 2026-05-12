import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'
import { adminAuth } from '../middleware/auth.js'

const router = Router()

const includeRelations = {
  images: {
    orderBy: {
      sortOrder: 'asc',
    },
  },
  responsibilities: {
    orderBy: {
      sortOrder: 'asc',
    },
  },
  impacts: {
    orderBy: {
      sortOrder: 'asc',
    },
  },
  technologies: {
    orderBy: {
      sortOrder: 'asc',
    },
  },
}

const slugSchema = z.object({
  slug: z.string().min(1),
})

router.get('/', async (_req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        id: 'asc',
      },
      select: {
        slug: true,
        name: true,
        summary: true,
      },
    })

    const cards = projects.map((project) => ({
      ...project,
      detailsUrl: `/projects/${project.slug}`,
    }))

    res.json(cards)
  } catch (error) {
    next(error)
  }
})

router.get('/:slug', async (req, res, next) => {
  try {
    const parseResult = slugSchema.safeParse(req.params)

    if (!parseResult.success) {
      return res.status(400).json({
        message: 'Invalid project slug',
      })
    }

    const project = await prisma.project.findUnique({
      where: {
        slug: parseResult.data.slug,
      },
      include: includeRelations,
    })

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      })
    }

    return res.json({
      slug: project.slug,
      name: project.name,
      summary: project.summary,
      responsibilities: project.responsibilities.map((item) => item.item),
      impacts: project.impacts.map((item) => item.item),
      technologies: project.technologies.map((item) => item.techName),
      coverImage: project.coverImage,
      images: project.images.map((item) => item.imageUrl),
      liveUrl: project.liveUrl,
      repoUrl: project.repoUrl,
    })
  } catch (error) {
    next(error)
  }
})

// ADMIN: Get all projects with full details for editing
router.get('/admin/all', adminAuth, async (_req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      include: includeRelations,
      orderBy: { id: 'asc' },
    })
    res.json(projects)
  } catch (error) {
    next(error)
  }
})

// ADMIN: Create project
router.post('/', adminAuth, async (req, res, next) => {
  try {
    const { slug, name, summary, coverImage, liveUrl, repoUrl, responsibilities, impacts, technologies, images } = req.body

    if (!slug || !name) {
      return res.status(400).json({ message: 'slug and name required' })
    }

    const project = await prisma.project.create({
      data: {
        slug,
        name,
        summary,
        coverImage,
        liveUrl,
        repoUrl,
        responsibilities: {
          create: (responsibilities || []).map((item, i) => ({
            item,
            sortOrder: i,
          })),
        },
        impacts: {
          create: (impacts || []).map((item, i) => ({
            item,
            sortOrder: i,
          })),
        },
        technologies: {
          create: (technologies || []).map((item, i) => ({
            techName: item,
            sortOrder: i,
          })),
        },
        images: {
          create: (images || []).map((item, i) => ({
            imageUrl: item,
            sortOrder: i,
          })),
        },
      },
      include: includeRelations,
    })

    res.status(201).json(project)
  } catch (error) {
    next(error)
  }
})

// ADMIN: Update project
router.put('/:slug', adminAuth, async (req, res, next) => {
  try {
    const { slug } = req.params
    const { name, summary, coverImage, liveUrl, repoUrl, responsibilities, impacts, technologies, images } = req.body

    // Delete existing relations
    await Promise.all([
      prisma.projectResponsibility.deleteMany({ where: { project: { slug } } }),
      prisma.projectImpact.deleteMany({ where: { project: { slug } } }),
      prisma.projectTechnology.deleteMany({ where: { project: { slug } } }),
      prisma.projectImage.deleteMany({ where: { project: { slug } } }),
    ])

    // Update project
    const project = await prisma.project.update({
      where: { slug },
      data: {
        name,
        summary,
        coverImage,
        liveUrl,
        repoUrl,
        responsibilities: {
          create: (responsibilities || []).map((item, i) => ({
            item,
            sortOrder: i,
          })),
        },
        impacts: {
          create: (impacts || []).map((item, i) => ({
            item,
            sortOrder: i,
          })),
        },
        technologies: {
          create: (technologies || []).map((item, i) => ({
            techName: item,
            sortOrder: i,
          })),
        },
        images: {
          create: (images || []).map((item, i) => ({
            imageUrl: item,
            sortOrder: i,
          })),
        },
      },
      include: includeRelations,
    })

    res.json(project)
  } catch (error) {
    next(error)
  }
})

// ADMIN: Delete project
router.delete('/:slug', adminAuth, async (req, res, next) => {
  try {
    const { slug } = req.params
    await prisma.project.delete({ where: { slug } })
    res.json({ message: 'Project deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
