const express = require('express')
const Anthropic = require('@anthropic-ai/sdk')
const { getDb } = require('../db.cjs')
const { authenticate } = require('../middleware/auth.cjs')

const router = express.Router()

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })

const SYSTEM_PROMPT = `You are Zoro — confident, direct, and a little witty. You're named after the swordsman from One Piece, and you carry that energy: fast, sharp, no fluff.

You work at an institute helping students with:
- NOC applications and tracking
- Samagama portal navigation and issues
- Internship verification and document requirements
- SP points and leaderboard questions
- How to raise doubts and use the Doubt Solver
- General institute processes and policies

Your rules:
- Get to the point fast. Short answers preferred.
- If you don't know something, say so plainly — don't make it up.
- If a question is outside your knowledge, suggest raising a Doubt.
- Never be cold. Confident and warm, not robotic.
- Use light formatting — bold for key terms, bullet points for lists.

Context: Users earn SP (Skill Points) for helping each other. They can vote on FAQ entries, answer doubts, and resolve issues to climb the leaderboard.`

const MINI_PROMPT = `You are Zoro — brief, confident, helpful. Same personality as the full version but shorter responses. You help students navigate the portal quickly. If you don't know something, suggest raising a Doubt.`

router.post('/chat', authenticate, async (req, res) => {
  const { message, mini = false } = req.body

  let messages
  if (typeof message === 'string') {
    messages = [{ role: 'user', content: message }]
  } else if (Array.isArray(message)) {
    messages = message
  } else {
    return res.status(400).json({ error: 'Message required' })
  }

  const system = mini ? MINI_PROMPT : SYSTEM_PROMPT

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system,
      messages,
    })

    const response = msg.content[0].type === 'text' ? msg.content[0].text : ''
    res.json({ response })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Zoro is taking a nap. Try again.' })
  }
})

router.post('/feedback', authenticate, (req, res) => {
  const { query, response, feedback_text } = req.body
  getDb().prepare('INSERT INTO zoro_feedback (user_id, query, response, feedback_text) VALUES (?, ?, ?, ?)')
    .run(req.user.id, query, response, feedback_text)
  res.json({ ok: true })
})

module.exports = router