import { useState, useRef, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ThumbsUp, ThumbsDown, X, BotMessageSquare, Loader2, Sword } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageTransition } from '../components/PageTransition'
import { useAuth } from '../context/AuthContext'
import { zoro } from '../lib/api'
import type { ChatMessage } from '../types'

const SYSTEM_PROMPT = 'You are Zoro, the institute AI assistant. You help students with questions about NOC, Samagama portal, internships, feedback, SP points, and the Doubt Solver. Be friendly, concise, and helpful. Use lists or bullet points when appropriate. If unsure, say so.'

export const ZoroPage = memo(function ZoroPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'assistant', content: `Hi ${user?.username ?? 'there'}! I'm Zoro, your institute AI assistant. How can I help you today?`, timestamp: Date.now() }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedbackMsgId, setFeedbackMsgId] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { inputRef.current?.focus() }, [])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    const query = input; setInput(''); setLoading(true)
    try {
      const { data } = await zoro.chat([
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: query }
      ])
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response, timestamp: Date.now() }
      setMessages(prev => [...prev, botMsg])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: "Sorry, I'm having trouble responding right now. Please try again.", timestamp: Date.now()
      }])
      toast.error('Zoro is unavailable')
    }
    setLoading(false)
  }

  const submitFeedback = async (msgId: string, thumbsUp: boolean) => {
    const text = feedbackText.trim()
    setMessages(prev => prev.map(m => m.id === msgId ? {
      ...m, thumbsUp: thumbsUp ? true : m.thumbsUp, thumbsDown: !thumbsUp ? true : m.thumbsDown
    } : m))
    try {
      await zoro.submitFeedback(msgId, thumbsUp, text || undefined)
      toast.success('Thanks for your feedback!')
    } catch { toast.error('Feedback failed') }
    setFeedbackMsgId(null); setFeedbackText('')
  }

  return (
    <PageTransition>
      <div className="px-6 py-8 max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/20 flex items-center justify-center">
            <Sword size={20} className="text-[#7c3aed]" />
          </div>
          <div>
            <h2 className="text-xl text-white font-bold">Zoro AI</h2>
            <p className="text-white/40 text-xs">Powered by Claude · Instant answers</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <div className={`max-w-[85%] flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5">
                    <BotMessageSquare size={14} className="text-[#7c3aed]" />
                    <span className="text-white/30 text-xs">Zoro</span>
                  </div>
                )}
                <div className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#7c3aed] text-white rounded-br-md'
                    : 'glass-card rounded-bl-md text-white/80'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2">
                    {msg.thumbsUp !== undefined ? (
                      <span className="text-white/20 text-xs">👍 Thanks!</span>
                    ) : (
                      <>
                        <button className="text-white/25 hover:text-white/60 text-xs transition-colors" onClick={() => setFeedbackMsgId(msg.id)}>
                          <ThumbsUp size={12} />
                        </button>
                        <button className="text-white/25 hover:text-white/60 text-xs transition-colors" onClick={() => submitFeedback(msg.id, false)}>
                          <ThumbsDown size={12} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="glass-card rounded-2xl rounded-bl-md px-5 py-4">
                <div className="typing-dot"><span /><span /><span /></div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="relative">
          <AnimatePresence>
            {feedbackMsgId && (
              <motion.div
                className="absolute bottom-full left-0 right-0 mb-2 glass-card rounded-2xl p-3"
                initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
              >
                <p className="text-white/40 text-xs mb-2">Tell us what was wrong (optional):</p>
                <div className="flex gap-2">
                  <input value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
                    placeholder="What could be better?"
                    className="flex-1 bg-white/5 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/30 outline-none"
                    autoFocus />
                  <button onClick={() => submitFeedback(feedbackMsgId, true)}
                    className="bg-green-600/20 text-green-400 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-green-600/30 transition-colors">
                    Send
                  </button>
                  <button onClick={() => { setFeedbackMsgId(null); setFeedbackText('') }}
                    className="text-white/30 hover:text-white/60 transition-colors px-1">
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 items-end">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Ask about NOC, Samagama, internships..."
              className="flex-1 bg-white/5 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/25 outline-none text-sm"
              disabled={loading}
            />
            <motion.button
              onClick={send}
              disabled={!input.trim() || loading}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-40 text-white rounded-2xl p-3.5 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </motion.button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
})

export default ZoroPage