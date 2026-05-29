const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getDb } = require('../db.cjs')
const { JWT_SECRET, authenticate } = require('../middleware/auth.cjs')

const router = express.Router()

router.post('/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' })

  const user = getDb().prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
  res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 })
  res.json({ user: { id: user.id, username: user.username, role: user.role, sp_points: user.sp_points } })
})

router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ ok: true })
})

router.get('/me', authenticate, (req, res) => {
  const user = getDb().prepare('SELECT id, username, role, sp_points FROM users WHERE id = ?').get(req.user.id)
  res.json({ user })
})

module.exports = router