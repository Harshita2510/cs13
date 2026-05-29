const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { initDb } = require('./db.cjs')

const authRoutes = require('./routes/auth.cjs')
const faqRoutes = require('./routes/faqs.cjs')
const doubtRoutes = require('./routes/doubts.cjs')
const zoroRoutes = require('./routes/zoro.cjs')
const adminRoutes = require('./routes/admin.cjs')

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5174', credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/faqs', faqRoutes)
app.use('/api/doubts', doubtRoutes)
app.use('/api/zoro', zoroRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (req, res) => res.json({ ok: true }))

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🗡️  Zoro Portal API running at http://localhost:${PORT}`)
  })
}).catch(err => {
  console.error('Failed to init DB:', err)
  process.exit(1)
})