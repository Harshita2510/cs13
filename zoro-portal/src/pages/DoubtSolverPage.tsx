import { useState, useCallback, memo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Heart, CheckCircle2, MessageSquare, Loader2, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageTransition } from '../components/PageTransition'
import { ListSkeleton, Skeleton } from '../components/Skeleton'
import { useConfetti } from '../components/Confetti'
import { doubts as doubtApi, admin as adminApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { Doubt, Answer } from '../types'

type AnswerStatus = 'pending' | 'approved' | 'rejected'
type FilterType = 'all' | AnswerStatus

const STATUS_STYLES: Record<AnswerStatus, { label: string; dot: string; badge: string }> = {
  pending:   { label: 'Pending',   dot: 'bg-yellow-400',         badge: 'bg-yellow-400/15 text-yellow-400' },
  approved:  { label: 'Approved',  dot: 'bg-green-400',          badge: 'bg-green-400/15 text-green-400' },
  rejected:  { label: 'Rejected',  dot: 'bg-red-400',            badge: 'bg-red-400/15 text-red-400' },
}

function StatusBadge({ status }: { status: AnswerStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function FilterBar({ filter, onChange }: { filter: FilterType; onChange: (f: FilterType) => void }) {
  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ]
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="text-white/30 text-xs font-medium uppercase tracking-widest mr-1">Filter</span>
      {filters.map(f => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            filter === f.key
              ? 'bg-[#7c3aed] border-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/20'
              : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/70 bg-white/5'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

function AnswerCard({
  answer,
  isAdmin,
  onApprove,
  onReject,
}: {
  answer: Answer
  isAdmin: boolean
  onApprove: (id: number) => void
  onReject: (id: number) => void
}) {
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    await onApprove(answer.id)
    setLoading(false)
  }
  const handleReject = async () => {
    setLoading(false)
    await onReject(answer.id)
  }

  const isPending = answer.status === 'pending'
  const isApproved = answer.status === 'approved'

  return (
    <motion.div
      className={`relative rounded-2xl p-4 transition-all border ${
        answer.status === 'pending'   ? 'border-yellow-400/25 bg-yellow-400/5' :
        answer.status === 'approved'  ? 'border-green-400/25 bg-green-400/5' :
                                        'border-red-400/25 bg-red-400/5'
      }`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 25 }}
    >
      {/* Status bar accent */}
      <div className={`absolute top-0 left-4 right-4 h-px rounded-full ${
        answer.status === 'pending'   ? 'bg-yellow-400/40' :
        answer.status === 'approved'  ? 'bg-green-400/40' :
                                        'bg-red-400/40'
      }`} />

      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <StatusBadge status={answer.status} />
            <span className="text-white/25 text-xs">·</span>
            <span className="text-white/40 text-xs">{answer.creator_name}</span>
            <span className="text-white/20 text-xs">·</span>
            <span className="text-white/30 text-xs">{new Date(answer.created_at).toLocaleDateString()}</span>
            {isApproved && (
              <>
                <span className="text-white/25 text-xs">·</span>
                <span className="flex items-center gap-1 text-yellow-400/80 text-xs font-semibold">
                  ⚡ +10 SP awarded
                </span>
              </>
            )}
          </div>

          <p className="text-white/80 text-sm leading-relaxed">{answer.body}</p>
        </div>

        {isPending && isAdmin && (
          <div className="flex flex-col gap-2 flex-shrink-0">
            {loading ? (
              <Loader2 size={16} className="text-white/30 animate-spin mx-auto" />
            ) : (
              <>
                <motion.button
                  onClick={handleApprove}
                  title="Approve (+10 SP)"
                  className="w-8 h-8 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 hover:bg-green-500/35 hover:shadow-lg hover:shadow-green-500/20 transition-all"
                  whileTap={{ scale: 0.88 }}
                >
                  <CheckCircle size={14} />
                </motion.button>
                <motion.button
                  onClick={handleReject}
                  title="Reject"
                  className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center text-red-400 hover:bg-red-500/25 hover:shadow-lg hover:shadow-red-500/15 transition-all"
                  whileTap={{ scale: 0.88 }}
                >
                  <XCircle size={14} />
                </motion.button>
              </>
            )}
          </div>
        )}

        {!isPending && (
          <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl ${
            isApproved
              ? 'bg-green-500/15 border border-green-500/25'
              : 'bg-red-500/10 border border-red-500/20'
          }`}>
            {isApproved
              ? <CheckCircle size={14} className="text-green-400" />
              : <XCircle size={14} className="text-red-400" />
            }
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-3 ml-0.5">
        <motion.button
          className="flex items-center gap-1.5 text-white/35 hover:text-[#ec4899] text-xs transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <Heart size={12} /> {answer.upvotes}
        </motion.button>
        {answer.is_accepted === 1 && (
          <span className="flex items-center gap-1 text-green-400 text-xs">
            <CheckCircle2 size={12} /> Accepted
          </span>
        )}
        <span className="ml-auto text-white/20 text-xs">
          {answer.status === 'pending' ? '⏳ Awaiting review' :
           answer.status === 'approved' ? '✅ Approved' : '✗ Rejected'}
        </span>
      </div>
    </motion.div>
  )
}

export const DoubtSolverPage = memo(function DoubtSolverPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [doubts, setDoubts] = useState<Doubt[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [detail, setDetail] = useState<Doubt | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeAnswer, setActiveAnswer] = useState('')
  const [answerFilter, setAnswerFilter] = useState<FilterType>('all')
  const fireConfetti = useConfetti()

  useEffect(() => {
    doubtApi.list().then(({ data }) => { setDoubts(data.doubts); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const openDetail = useCallback(async (id: number) => {
    setDetailId(id)
    setDetailLoading(true)
    setAnswerFilter('all')
    try {
      const { data } = await doubtApi.get(id)
      setDetail(data.doubt)
      setAnswers(data.answers)
    } catch { toast.error('Failed to load') }
    setDetailLoading(false)
  }, [])

  const handleApprove = useCallback(async (answerId: number) => {
    try {
      const { data } = await adminApi.updateAnswerStatus(answerId, 'approved')
      setAnswers(prev => prev.map(a => a.id === answerId ? data.answer : a))
      toast.success('✅ Answer approved! +10 SP awarded')
    } catch { toast.error('Failed to approve') }
  }, [])

  const handleReject = useCallback(async (answerId: number) => {
    try {
      const { data } = await adminApi.updateAnswerStatus(answerId, 'rejected')
      setAnswers(prev => prev.map(a => a.id === answerId ? data.answer : a))
      toast.success('✗ Answer rejected')
    } catch { toast.error('Failed to reject') }
  }, [])

  const submitDoubt = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setSubmitting(true)
    try {
      const { data } = await doubtApi.create(title, body)
      setDoubts(prev => [data.doubt, ...prev])
      setModalOpen(false); setTitle(''); setBody('')
      toast.success('Doubt raised!')
    } catch { toast.error('Failed to raise doubt') }
    setSubmitting(false)
  }, [title, body])

  const submitAnswer = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeAnswer.trim() || detailId === null) return
    setDetailLoading(true)
    try {
      const { data } = await doubtApi.answer(detailId, activeAnswer)
      setAnswers(prev => [...prev, data.answer])
      setActiveAnswer('')
      toast.success('Answer posted!')
    } catch { toast.error('Failed to post answer') }
    setDetailLoading(false)
  }, [activeAnswer, detailId])

  const handleUpvote = useCallback(async (answerId: number) => {
    setAnswers(prev => prev.map(a => a.id === answerId ? { ...a, upvotes: a.upvotes + 1 } : a))
    try {
      await doubtApi.upvote(answerId)
      toast.success('+5 SP points!')
    } catch { toast.error('Upvote failed') }
  }, [])

  const handleResolve = useCallback(async () => {
    if (!detailId) return
    try {
      await doubtApi.resolve(detailId)
      setDoubts(prev => prev.map(d => d.id === detailId ? { ...d, status: 'resolved' } : d))
      if (detail) setDetail({ ...detail, status: 'resolved' })
      fireConfetti()
      toast.success('Resolved! +20 SP points!')
    } catch { toast.error('Failed to resolve') }
  }, [detailId, detail, fireConfetti])

  const filteredAnswers = answerFilter === 'all'
    ? answers
    : answers.filter(a => a.status === answerFilter)

  const answerCounts = {
    all: answers.length,
    pending: answers.filter(a => a.status === 'pending').length,
    approved: answers.filter(a => a.status === 'approved').length,
    rejected: answers.filter(a => a.status === 'rejected').length,
  }

  return (
    <PageTransition>
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl text-white font-bold">Doubt Solver</h2>
            <p className="text-white/40 text-sm mt-1">
              {isAdmin ? 'Review and moderate answers' : 'Help each other, earn SP points'}
            </p>
          </div>
          <motion.button onClick={() => setModalOpen(true)}
            className="bg-[#7c3aed] rounded-full px-5 py-2.5 text-white text-sm font-medium flex items-center gap-2"
            whileTap={{ scale: 0.95 }}>
            <Plus size={18} /> Raise Doubt
          </motion.button>
        </div>

        {loading ? <ListSkeleton count={4} /> : (
          <div className="space-y-4">
            {doubts.map((doubt, i) => (
              <motion.div key={doubt.id} className="glass-card rounded-2xl p-5 cursor-pointer"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.01 }} onClick={() => openDetail(doubt.id)}>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[#7c3aed] text-xs font-semibold uppercase tracking-widest">{doubt.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${doubt.status === 'resolved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{doubt.status}</span>
                    </div>
                    <h3 className="text-white font-medium text-base">{doubt.title}</h3>
                    <p className="text-white/40 text-sm mt-1 line-clamp-2">{doubt.body}</p>
                    <p className="text-white/20 text-xs mt-2">by {doubt.creator_name} · {new Date(doubt.created_at).toLocaleDateString()}</p>
                  </div>
                  <MessageSquare size={18} className="text-white/20 flex-shrink-0 mt-1" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Raise Doubt Modal */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)}>
              <motion.div className="glass-card rounded-3xl p-6 w-full max-w-lg"
                initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }} onClick={e => e.stopPropagation()}>
                <h3 className="text-white font-semibold text-lg mb-4">Raise a Doubt</h3>
                <form onSubmit={submitDoubt} className="space-y-4">
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What's your doubt about?"
                    className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none border border-white/5 focus:border-[#7c3aed]/50 text-sm" required />
                  <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Describe your issue in detail..." rows={4}
                    className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none border border-white/5 focus:border-[#7c3aed]/50 text-sm resize-none" required />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setModalOpen(false)} className="flex-1 glass-card rounded-xl py-3 text-white/60 text-sm">Cancel</button>
                    <motion.button type="submit" disabled={submitting}
                      className="flex-1 bg-[#7c3aed] rounded-xl py-3 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                      whileTap={{ scale: 0.97 }}>
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detail / Answer Thread Modal */}
        <AnimatePresence>
          {detailId !== null && (
            <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailId(null)}>
              <motion.div className="glass-card rounded-3xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto"
                initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }} onClick={e => e.stopPropagation()}>
                {detailLoading ? (
                  <div className="space-y-3 py-4"><Skeleton lines={3} /><Skeleton lines={2} /></div>
                ) : detail ? (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[#7c3aed] text-xs font-semibold uppercase tracking-widest">{detail.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${detail.status === 'resolved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{detail.status}</span>
                    </div>
                    <h3 className="text-white text-xl font-semibold mb-2">{detail.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed mb-1">{detail.body}</p>
                    <p className="text-white/20 text-xs mb-5">by {detail.creator_name}</p>

                    {/* Answer Filter Bar (admin only) */}
                    {isAdmin && answers.length > 0 && (
                      <div className="mb-4">
                        <FilterBar filter={answerFilter} onChange={setAnswerFilter} />
                        {/* Answer count summary */}
                        <div className="flex gap-4 text-xs text-white/30 mb-3">
                          <span>{answerCounts.pending} pending</span>
                          <span>{answerCounts.approved} approved</span>
                          <span>{answerCounts.rejected} rejected</span>
                        </div>
                      </div>
                    )}

                    {/* Answer list */}
                    <div className="space-y-3 mb-4">
                      {filteredAnswers.length === 0 ? (
                        <div className="text-center py-6 text-white/30 text-sm">
                          {answerFilter === 'all' ? 'No answers yet — be the first!' : `No ${answerFilter} answers`}
                        </div>
                      ) : (
                        filteredAnswers.map((ans) => (
                          <AnswerCard
                            key={ans.id}
                            answer={ans}
                            isAdmin={isAdmin}
                            onApprove={handleApprove}
                            onReject={handleReject}
                          />
                        ))
                      )}
                    </div>

                    {detail.status !== 'resolved' && (
                      <form onSubmit={submitAnswer} className="mt-4 flex gap-2">
                        <input value={activeAnswer} onChange={e => setActiveAnswer(e.target.value)} placeholder="Write an answer..."
                          className="flex-1 bg-white/5 rounded-full px-5 py-2.5 text-white placeholder:text-white/30 outline-none text-sm" />
                        <motion.button type="submit" className="bg-[#7c3aed] rounded-full p-2.5 text-white" whileTap={{ scale: 0.9 }}>
                          <MessageSquare size={18} />
                        </motion.button>
                        <motion.button type="button" onClick={handleResolve} className="bg-green-600 rounded-full p-2.5 text-white" whileTap={{ scale: 0.9 }} title="Mark resolved">
                          <CheckCircle2 size={18} />
                        </motion.button>
                      </form>
                    )}

                    {isAdmin && detail.status === 'resolved' && (
                      <div className="mt-4 flex items-center gap-2 text-green-400/70 text-xs">
                        <CheckCircle2 size={13} /> Marked as resolved
                      </div>
                    )}
                  </>
                ) : null}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
})

export default DoubtSolverPage