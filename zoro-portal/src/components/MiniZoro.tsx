import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sword, Send, X, BotMessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { zoro } from '../lib/api'
import type { ChatMessage } from '../types'

export function MiniZoro() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    const query = input; setInput(''); setLoading(true)
    try {
      const { data } = await zoro.chat(query)
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response, timestamp: Date.now() }
      setMessages(prev => [...prev, botMsg])
    } catch { toast.error('Zoro is unavailable. Make sure the API server is running.') }
    setLoading(false)
  }

  return (
    <>
      {/* Toggle button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#7c3aed] flex items-center justify-center z-40 zoro-glow shadow-lg"
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(v => !v)}
      >
        {open ? <X size={22} className="text-white" /> : <Sword size={22} className="text-white" />}
      </motion.button>

      {/* Chat drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-24 right-6 w-80 max-w-[calc(100vw-48px)] glass-card rounded-3xl overflow-hidden z-40"
            style={{ height: 420 }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            {/* Header */}
            <div className="bg-[#7c3aed]/20 px-5 py-4 flex items-center gap-3 border-b border-white/5">
              <BotMessageSquare size={18} className="text-[#7c3aed]" />
              <span className="text-white font-semibold text-sm">Zoro AI</span>
              <button className="ml-auto text-white/40 hover:text-white" onClick={() => setOpen(false)}><X size={16} /></button>
            </div>

            {/* Messages */}
            <div className="overflow-y-auto p-4 space-y-3" style={{ height: 300 }}>
              {messages.length === 0 && (
                <p className="text-white/30 text-xs text-center mt-8">Ask me anything about the institute!</p>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user' ? 'bg-[#7c3aed] text-white rounded-br-md' : 'bg-white/5 text-white/80 rounded-bl-md'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="typing-dot"><span /><span /><span /></div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask Zoro..."
                className="flex-1 bg-white/5 rounded-full px-4 py-2 text-sm text-white placeholder:text-white/30 outline-none"
              />
              <motion.button onClick={send} className="bg-[#7c3aed] rounded-full p-2 text-white" whileTap={{ scale: 0.9 }}>
                <Send size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}