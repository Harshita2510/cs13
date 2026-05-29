const express = require('express')
const { getDb } = require('../db.cjs')
const { authenticate } = require('../middleware/auth.cjs')

const router = express.Router()

router.get('/', (req, res) => {
  const { q, category } = req.query
  let items = getDb().prepare('SELECT * FROM faq_items ORDER BY helpful_votes DESC').all()

  if (category && category !== 'All') {
    items = items.filter(i => i.category === category)
  }

  if (q) {
    const lower = q.toLowerCase()
    items = items.filter(i =>
      i.title.toLowerCase().includes(lower) ||
      i.body.toLowerCase().includes(lower) ||
      JSON.parse(i.keywords || '[]').some((k) => k.toLowerCase().includes(lower))
    )
  }

  const categories = [...new Set(items.map(i => i.category))]
  res.json({ items, categories })
})

router.get('/search', (req, res) => {
  const { q } = req.query
  if (!q) return res.json({ results: [] })

  const lower = q.toLowerCase()
  const items = getDb().prepare('SELECT * FROM faq_items ORDER BY helpful_votes DESC').all()
  const results = items.filter(i =>
    i.title.toLowerCase().includes(lower) ||
    JSON.parse(i.keywords || '[]').some((k) => k.toLowerCase().includes(lower))
  ).slice(0, 6)

  res.json({ results })
})

router.post('/vote', authenticate, (req, res) => {
  const { id, helpful } = req.body
  const col = helpful ? 'helpful_votes' : 'unhelpful_votes'
  getDb().prepare(`UPDATE faq_items SET ${col} = ${col} + 1 WHERE id = ?`).run(id)
  getDb().prepare('UPDATE users SET sp_points = sp_points + 2 WHERE id = ?').run(req.user.id)
  const item = getDb().prepare('SELECT * FROM faq_items WHERE id = ?').get(id)
  res.json({ item })
})

router.patch('/:id/vote', (req, res) => {
  const { type } = req.body
  if (!['helpful', 'unhelpful'].includes(type)) {
    return res.status(400).json({ error: 'type must be "helpful" or "unhelpful"' })
  }
  const col = type === 'helpful' ? 'helpful_votes' : 'unhelpful_votes'
  getDb().prepare(`UPDATE faq_items SET ${col} = ${col} + 1 WHERE id = ?`).run(req.params.id)
  const item = getDb().prepare('SELECT * FROM faq_items WHERE id = ?').get(req.params.id)
  res.json({ item })
})

module.exports = router