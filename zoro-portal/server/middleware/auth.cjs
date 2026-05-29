const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'zoro-portal-secret-key-2024'

const authenticate = (req, res, next) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  try {
    const user = jwt.verify(token, JWT_SECRET)
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  next()
}

module.exports = { authenticate, requireAdmin, JWT_SECRET }