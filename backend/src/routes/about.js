import express from 'express'
import { adminAuth } from '../middleware/auth.js'
import prisma from '../lib/prisma.js'

const router = express.Router()

// GET about (public) - returns single about record with all sections
router.get('/', async (req, res) => {
  try {
    const about = await prisma.about.findFirst({
      include: {
        sections: {
          include: {
            items: {
              orderBy: {
                sortOrder: 'asc',
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    })

    if (!about) {
      return res.json(null)
    }

    // Transform sections to include items
    const transformedSections = about.sections.map((section) => ({
      title: section.title,
      content: section.content,
      items: section.items.length > 0 ? section.items.map((item) => item.item) : undefined,
    }))

    res.json({
      id: about.id,
      sections: transformedSections,
    })
  } catch (error) {
    console.error('Error fetching about:', error)
    res.status(500).json({ message: 'Failed to fetch about' })
  }
})

// GET about/admin/all (admin) - returns full about data with all details
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const about = await prisma.about.findFirst({
      include: {
        sections: {
          include: {
            items: {
              orderBy: {
                sortOrder: 'asc',
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    })

    res.json(about || { sections: [] })
  } catch (error) {
    console.error('Error fetching all about:', error)
    res.status(500).json({ message: 'Failed to fetch about' })
  }
})

// POST about (admin) - create or update about with sections
router.post('/', adminAuth, async (req, res) => {
  try {
    const { sections } = req.body

    // Delete existing about record if it exists
    await prisma.about.deleteMany()

    // Create new about with sections
    const about = await prisma.about.create({
      data: {
        sections: {
          create: sections.map((section, idx) => ({
            title: section.title,
            content: section.content || null,
            sortOrder: idx,
            items: {
              create: (section.items || []).map((item, itemIdx) => ({
                item,
                sortOrder: itemIdx,
              })),
            },
          })),
        },
      },
      include: {
        sections: {
          include: {
            items: true,
          },
        },
      },
    })

    res.json(about)
  } catch (error) {
    console.error('Error creating about:', error)
    res.status(500).json({ message: 'Failed to create about' })
  }
})

// PUT about/:id (admin) - update about section
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, items } = req.body

    // Update section
    const section = await prisma.aboutSection.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content: content || null,
      },
      include: {
        items: true,
      },
    })

    // If items provided, update them
    if (items) {
      await prisma.aboutItem.deleteMany({
        where: { sectionId: parseInt(id) },
      })

      await prisma.aboutItem.createMany({
        data: items.map((item, idx) => ({
          sectionId: parseInt(id),
          item,
          sortOrder: idx,
        })),
      })

      section.items = items.map((item, idx) => ({
        id: idx + 1,
        item,
        sortOrder: idx,
      }))
    }

    res.json(section)
  } catch (error) {
    console.error('Error updating about section:', error)
    res.status(500).json({ message: 'Failed to update about section' })
  }
})

// DELETE about/:id (admin) - delete about section
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params

    await prisma.aboutSection.delete({
      where: { id: parseInt(id) },
    })

    res.json({ message: 'Section deleted successfully' })
  } catch (error) {
    console.error('Error deleting about section:', error)
    res.status(500).json({ message: 'Failed to delete about section' })
  }
})

export default router
