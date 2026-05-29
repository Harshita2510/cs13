import { useState, useCallback, memo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Pencil, Trash2, Sparkles, BarChart3, Users, MessageSquare, HelpCircle, Megaphone, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageTransition } from '../components/PageTransition'
import { useAuth } from '../context/AuthContext'
import { admin } from '../lib/api'
import type { Doubt, FaqItem, Announcement } from '../types'

interface Stats { total: number; resolved: number; pending: number; feedback: number; users: number; faqs: number }

function CountUp({ target }: { target: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (800 / 16)
    const t = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(t) }
      else setVal(Math.floor(start))
    }, 16)
    return () => clearInterval(t)
  }, [target])
  return <>{val}</>
}

type Tab = 'doubts' | 'feedback' | 'faq' | 'users' | 'announcements'

export const AdminPage = memo(function AdminPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({ total: 0, resolved: 0, pending: 0, feedback: 0, users: 0, faqs: 0 })
  const [tab, setTab] = useState<Tab>('doubts')
  const [doubts, setDoubts] = useState<Doubt[]>([])
  const [feedback, setFeedback] = useState<any[]>([])
  const [faqItems, setFaqItems] = useState<FaqItem[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', body: '' })
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [draftAnswer, setDraftAnswer] = useState('')
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null)
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null)
  const [newFaq, setNewFaq] = useState({ title: '', body: '', category: 'NOC', keywords: '' })

  useEffect(() => {
    admin.stats().then(({ data }) => setStats(data)).catch(() => {})
    admin.doubts().then(({ data }) => setDoubts(data.doubts)).catch(() => {})
    admin.feedback().then(({ data }) => setFeedback(data.feedback)).catch(() => {})
    admin.faq().then(({ data }) => setFaqItems(data.items)).catch(() => {})
    admin.users().then(({ data }) => setUsers(data.users)).catch(() => {})
    admin.announcements().then(({ data }) => setAnnouncements(data.announcements)).catch(() => {})
    setLoading(false)
  }, [])

  const generateAnswer = useCallback(async (doubt: Doubt) => {
    setSelectedDoubt(doubt)
    setDraftAnswer('')
    setGenerating(true)
    try {
      const { data } = await admin.generateAnswer(doubt.body)
      setDraftAnswer(data.answer)
    } catch { toast.error('Generation failed') }
    setGenerating(false)
  }, [])

  const handleDeleteFaq = useCallback(async (id: number) => {
    try {
      await admin.deleteFaq(id)
      setFaqItems(prev => prev.filter(f => f.id !== id))
      toast.success('FAQ deleted')
    } catch { toast.error('Delete failed') }
  }, [])

  const handleSaveFaq = useCallback(async () => {
    if (!editingFaq && (!newFaq.title || !newFaq.body)) return
    try {
      if (editingFaq) {
        await admin.updateFaq(editingFaq.id, {
          title: editingFaq.title, body: editingFaq.body, category: editingFaq.category,
          keywords: editingFaq.keywords.split(',').map((k: string) => k.trim()),
        })
        setFaqItems(prev => prev.map(f => f.id === editingFaq.id ? { ...editingFaq } : f))
        toast.success('FAQ updated')
      } else {
        const { data } = await admin.createFaq({
          title: newFaq.title, body: newFaq.body, category: newFaq.category,
          keywords: newFaq.keywords.split(',').map((k: string) => k.trim()),
        })
        setFaqItems(prev => [{ ...newFaq, keywords: newFaq.keywords, id: data.id, helpful_votes: 0, unhelpful_votes: 0, created_at: new Date().toISOString() } as FaqItem, ...prev])
        setNewFaq({ title: '', body: '', category: 'NOC', keywords: '' })
        toast.success('FAQ created')
      }
      setEditingFaq(null)
    } catch { toast.error('Save failed') }
  }, [editingFaq, newFaq])

  const TABS: { id: Tab; label: string; Icon: any }[] = [
    { id: 'doubts', label: 'Doubts', Icon: MessageSquare },
    { id: 'feedback', label: 'Zoro Feedback', Icon: Sparkles },
    { id: 'faq', label: 'FAQ', Icon: HelpCircle },
    { id: 'users', label: 'Users', Icon: Users },
    { id: 'announcements', label: 'Announcements', Icon: Megaphone },
  ]

  return (
    <PageTransition>
      <div className="px-6 py-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 size={24} className="text-[#7c3aed]" />
          <div>
            <h2 className="text-2xl text-white font-bold">Admin Dashboard</h2>
            <p className="text-white/40 text-xs mt-0.5">Hidden at /admin-x9k2</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Queries', value: stats.total },
            { label: 'Resolved', value: stats.resolved },
            { label: 'Pending', value: stats.pending },
            { label: 'Feedback', value: stats.feedback },
            { label: 'Users', value: stats.users },
            { label: 'FAQs', value: stats.faqs },
          ].map((s, i) => (
            <motion.div key={s.label} className="glass-card rounded-2xl p-4"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <p className="text-white/40 text-xs mb-1">{s.label}</p>
              <p className="text-white text-2xl font-bold"><CountUp target={s.value} /></p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${tab === id ? 'bg-[#7c3aed] text-white' : 'glass-card text-white/50 hover:text-white'}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-[#7c3aed] animate-spin" /></div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {tab === 'doubts' && (
                <div className="space-y-3">
                  {doubts.map((d, i) => (
                    <motion.div key={d.id} className="glass-card rounded-2xl p-5"
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[#7c3aed] text-xs font-semibold uppercase tracking-widest">{d.category}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === 'resolved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{d.status}</span>
                          </div>
                          <h4 className="text-white font-medium">{d.title}</h4>
                          <p className="text-white/40 text-sm mt-1">{d.body}</p>
                          <p className="text-white/20 text-xs mt-2">by {d.creator_name}</p>
                        </div>
                        <motion.button onClick={() => generateAnswer(d)}
                          className="flex items-center gap-1 bg-[#7c3aed]/20 text-[#7c3aed] rounded-full px-3 py-1.5 text-xs font-medium flex-shrink-0"
                          whileTap={{ scale: 0.95 }}>
                          <Sparkles size={12} /> Draft Answer
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {tab === 'feedback' && (
                <div className="space-y-3">
                  {feedback.length === 0 && <p className="text-white/30 text-sm text-center py-12">No feedback yet</p>}
                  {feedback.map((f, i) => (
                    <motion.div key={f.id} className="glass-card rounded-2xl p-5"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                      <p className="text-white/40 text-xs mb-2">User: {f.username || 'Unknown'}</p>
                      <p className="text-white/60 text-sm mb-2">Q: <span className="text-white/80">{f.query}</span></p>
                      <p className="text-white/60 text-sm mb-2">A: <span className="text-white/80">{f.response?.slice(0, 120)}...</span></p>
                      <p className="text-red-400/80 text-xs italic">"{f.feedback_text}"</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {tab === 'faq' && (
                <div className="space-y-4">
                  <div className="glass-card rounded-2xl p-5">
                    <h4 className="text-white/60 text-sm font-medium mb-3">Add / Edit FAQ</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <input value={editingFaq?.title ?? newFaq.title}
                        onChange={e => editingFaq ? setEditingFaq({ ...editingFaq, title: e.target.value }) : setNewFaq({ ...newFaq, title: e.target.value })}
                        placeholder="Question title"
                        className="bg-white/5 rounded-xl px-4 py-2 text-white placeholder:text-white/30 outline-none text-sm" />
                      <input value={editingFaq?.category ?? newFaq.category}
                        onChange={e => editingFaq ? setEditingFaq({ ...editingFaq, category: e.target.value }) : setNewFaq({ ...newFaq, category: e.target.value })}
                        placeholder="Category"
                        className="bg-white/5 rounded-xl px-4 py-2 text-white placeholder:text-white/30 outline-none text-sm" />
                      <input value={editingFaq?.keywords ?? newFaq.keywords}
                        onChange={e => editingFaq ? setEditingFaq({ ...editingFaq, keywords: e.target.value }) : setNewFaq({ ...newFaq, keywords: e.target.value })}
                        placeholder="Keywords (comma separated)"
                        className="bg-white/5 rounded-xl px-4 py-2 text-white placeholder:text-white/30 outline-none text-sm md:col-span-2" />
                      <textarea value={editingFaq?.body ?? newFaq.body}
                        onChange={e => editingFaq ? setEditingFaq({ ...editingFaq, body: e.target.value }) : setNewFaq({ ...newFaq, body: e.target.value })}
                        placeholder="Answer body" rows={3}
                        className="bg-white/5 rounded-xl px-4 py-2 text-white placeholder:text-white/30 outline-none text-sm resize-none md:col-span-2" />
                    </div>
                    <div className="flex gap-2">
                      <motion.button onClick={handleSaveFaq}
                        className="bg-[#7c3aed] rounded-full px-5 py-2 text-white text-sm font-medium" whileTap={{ scale: 0.97 }}>
                        {editingFaq ? 'Update' : 'Add'} FAQ
                      </motion.button>
                      {editingFaq && <button onClick={() => setEditingFaq(null)} className="glass-card rounded-full px-5 py-2 text-white/60 text-sm">Cancel</button>}
                    </div>
                  </div>
                  {faqItems.map((item, i) => (
                    <motion.div key={item.id} className="glass-card rounded-2xl p-5"
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <span className="text-[#7c3aed] text-xs font-semibold uppercase tracking-widest">{item.category}</span>
                          <h4 className="text-white font-medium mt-0.5">{item.title}</h4>
                          <p className="text-white/40 text-sm mt-1">{item.body}</p>
                          <p className="text-white/20 text-xs mt-2">👍 {item.helpful_votes} &nbsp; 👎 {item.unhelpful_votes}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <motion.button onClick={() => setEditingFaq(item)}
                            className="glass-card rounded-full p-2 text-white/50 hover:text-white transition-colors" whileTap={{ scale: 0.9 }}>
                            <Pencil size={14} />
                          </motion.button>
                          <motion.button onClick={() => handleDeleteFaq(item.id)}
                            className="glass-card rounded-full p-2 text-white/50 hover:text-red-400 transition-colors" whileTap={{ scale: 0.9 }}>
                            <Trash2 size={14} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {tab === 'users' && (
                <div className="space-y-2">
                  {users.map((u, i) => (
                    <motion.div key={u.id} className="glass-card rounded-2xl px-5 py-4 flex items-center justify-between"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : i === 2 ? 'bg-orange-600/20 text-orange-400' : 'glass-card text-white/50'}`}>{i + 1}</div>
                        <div>
                          <p className="text-white text-sm font-medium">{u.username}</p>
                          <p className="text-white/30 text-xs">{u.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#7c3aed] text-sm font-bold">{u.sp_points} SP</p>
                        <p className="text-white/20 text-xs">{new Date(u.created_at).toLocaleDateString()}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {tab === 'announcements' && (
                <div className="space-y-4">
                  <div className="glass-card rounded-2xl p-5">
                    <h4 className="text-white/60 text-sm font-medium mb-3">Post New Announcement</h4>
                    <div className="space-y-3">
                      <input value={newAnnouncement.title}
                        onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                        placeholder="Announcement title"
                        className="w-full bg-white/5 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 outline-none text-sm" />
                      <textarea value={newAnnouncement.body}
                        onChange={e => setNewAnnouncement({ ...newAnnouncement, body: e.target.value })}
                        placeholder="Announcement body..."
                        rows={3}
                        className="w-full bg-white/5 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 outline-none text-sm resize-none" />
                      <motion.button
                        onClick={async () => {
                          if (!newAnnouncement.title || !newAnnouncement.body) return
                          try {
                            const { data } = await admin.createAnnouncement(newAnnouncement.title, newAnnouncement.body)
                            setAnnouncements(prev => [{ ...newAnnouncement, id: data.id, created_at: new Date().toISOString(), creator_name: user?.username ?? 'admin', created_by: user?.id ?? 1 }, ...prev])
                            setNewAnnouncement({ title: '', body: '' })
                            toast.success('Announcement posted')
                          } catch { toast.error('Failed to post') }
                        }}
                        disabled={!newAnnouncement.title || !newAnnouncement.body}
                        className="bg-[#7c3aed] rounded-full px-5 py-2 text-white text-sm font-medium disabled:opacity-40 flex items-center gap-2"
                        whileTap={{ scale: 0.97 }}>
                        <Plus size={14} /> Post Announcement
                      </motion.button>
                    </div>
                  </div>
                  {announcements.map((a, i) => (
                    <motion.div key={a.id} className="glass-card rounded-2xl p-5"
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm">{a.title}</p>
                          <p className="text-white/50 text-xs mt-1 leading-relaxed">{a.body}</p>
                          <p className="text-white/20 text-xs mt-2">{new Date(a.created_at).toLocaleDateString()} · by {a.creator_name}</p>
                        </div>
                        <motion.button onClick={async () => {
                          try {
                            await admin.deleteAnnouncement(a.id)
                            setAnnouncements(prev => prev.filter(x => x.id !== a.id))
                            toast.success('Deleted')
                          } catch { toast.error('Delete failed') }
                        }}
                          className="glass-card rounded-full p-2 text-white/50 hover:text-red-400 transition-colors flex-shrink-0"
                          whileTap={{ scale: 0.9 }}>
                          <Trash2 size={14} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Draft Answer Modal */}
        <AnimatePresence>
          {selectedDoubt && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDoubt(null)}>
              <motion.div className="glass-card rounded-3xl p-6 w-full max-w-lg"
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}>
                <h3 className="text-white font-semibold mb-2">Draft Answer Generator</h3>
                <p className="text-white/40 text-xs mb-4">{selectedDoubt.title}</p>
                {generating ? (
                  <div className="flex items-center gap-2 text-white/50 text-sm py-4"><Loader2 size={16} className="animate-spin" /> Generating with Claude...</div>
                ) : draftAnswer ? (
                  <div className="bg-white/5 rounded-xl p-4 mb-4"><p className="text-white/80 text-sm leading-relaxed">{draftAnswer}</p></div>
                ) : null}
                <button onClick={() => setSelectedDoubt(null)} className="glass-card rounded-full px-4 py-2 text-white/60 text-sm">Close</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
})

export default AdminPage