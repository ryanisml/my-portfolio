// Basic admin authentication middleware
// Docker Compose env_file may preserve wrapping quotes; normalize once at startup.
const rawAdminPassword = process.env.ADMIN_PASSWORD || 'admin123'
const ADMIN_PASSWORD = rawAdminPassword.replace(/^['\"](.*)['\"]$/, '$1')

export function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1] // Bearer token

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Missing token' })
  }

  if (token !== ADMIN_PASSWORD) {
    return res.status(403).json({ message: 'Forbidden: Invalid token' })
  }

  next()
}
