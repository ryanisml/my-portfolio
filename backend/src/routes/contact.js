import { Router } from 'express'
import { prisma } from '../db.js'
import { adminAuth } from '../middleware/auth.js'

const router = Router()

// GET contact information
router.get('/', async (_req, res, next) => {
  try {
    const contact = await prisma.contact.findFirst()

    if (!contact) {
      return res.status(404).json({ message: 'Contact information not found' })
    }

    res.json(contact)
  } catch (error) {
    next(error)
  }
})

// ADMIN: Update contact information
router.put('/', adminAuth, async (req, res, next) => {
  try {
    const { email, phone, address, location, latitude, longitude, message } = req.body

    // Get existing contact or create if doesn't exist
    let contact = await prisma.contact.findFirst()

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          email,
          phone,
          address,
          location,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          message,
        },
      })
    } else {
      contact = await prisma.contact.update({
        where: { id: contact.id },
        data: {
          email,
          phone,
          address,
          location,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          message,
        },
      })
    }

    res.json(contact)
  } catch (error) {
    next(error)
  }
})

export default router
