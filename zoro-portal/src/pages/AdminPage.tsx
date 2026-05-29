import { memo, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Clock3, Filter, ShieldCheck, X, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageTransition } from '../components/PageTransition'
import { getAdminAnswers, onMockStoreChange, updateAnswerStatus, type AdminAnswer } from '../lib/mockStore'
import type { AnswerStatus } from '../types'

type StatusFilter = 'all' | AnswerStatus

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const statusStyles: Record<AnswerStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-300 border-amber-400/20',
  approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20',
  rejected: 'bg-rose-500/15 text-rose-300 border-rose-400/20',
}

export const AdminPage = memo(function AdminPage() {
  const [answers, setAnswers] = useState<AdminAnswer[]>(() => getAdminAnswers())
  const [filter, setFilter] = useState<StatusFilter>('pending')
  const [search, setSearch] = useState('')

  useEffect(() => onMockStoreChange(() => setAnswers(getAdminAnswers())), [])

  const counts = useMemo(() => {
    return answers.reduce(
      (acc, answer) => {
        acc.all += 1
        acc[answer.status] += 1
        return acc
      },
      { all: 0, pending: 0, approved: 0, rejected: 0 } as Record<StatusFilter, number>,
    )
  }, [answers])

  const visibleAnswers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return answers.filter(answer => {
      const matchesFilter = filter === 'all' || answer.status === filter
      const matchesSearch =
        !query ||
        answer.question.toLowerCase().includes(query) ||
        answer.creator_name.toLowerCase().includes(query) ||
        answer.body.toLowerCase().includes(query)

      return matchesFilter && matchesSearch
    })
  }, [answers, filter, search])

  const updateStatus = (id: number, status: AnswerStatus) => {
    const currentAnswer = answers.find(answer => answer.id === id)
    const willGrantSp = status === 'approved' && !currentAnswer?.sp_awarded
    const answer = updateAnswerStatus(id, status)
    setAnswers(getAdminAnswers())
    toast.success(status === 'approved' && answer && willGrantSp ? 'Answer approved. SP granted.' : `Answer ${status}`)
  }

  return (
    <PageTransition>
      <main className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
        <section className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#06b6d4]/10 border border-[#06b6d4]/20">
                  <ShieldCheck size={20} className="text-[#06b6d4]" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Answer Review</h1>
                  <p className="text-white/40 text-sm mt-1">Approve, reject, and filter submitted answers.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:min-w-[420px]">
              {(['pending', 'approved', 'rejected'] as AnswerStatus[]).map(status => (
                <div key={status} className="glass-card rounded-lg px-4 py-3">
                  <p className="text-white/35 text-xs capitalize">{status}</p>
                  <p className="text-white text-2xl font-bold leading-tight mt-1">{counts[status]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-card rounded-lg p-4 sm:p-5 mb-5">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Filter size={16} className="text-[#06b6d4] flex-shrink-0" />
              <div className="flex gap-2 overflow-x-auto pb-1">
                {FILTERS.map(item => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    className={`h-9 px-3 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                      filter === item.value
                        ? 'bg-[#06b6d4]/15 text-white border-[#06b6d4]/35'
                        : 'bg-white/[0.03] text-white/45 border-white/10 hover:text-white'
                    }`}
                  >
                    {item.label} ({counts[item.value]})
                  </button>
                ))}
              </div>
            </div>

            <label className="relative block w-full lg:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search answers"
                className="cosmic-input pl-10 h-10"
              />
            </label>
          </div>
        </section>

        <section className="glass-card rounded-lg overflow-hidden">
          <div className="hidden lg:grid grid-cols-[1.25fr_0.75fr_1.6fr_0.65fr_0.8fr] gap-4 px-5 py-3 border-b border-white/10 text-xs font-semibold uppercase text-white/35">
            <span>Question</span>
            <span>User</span>
            <span>Answer</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-white/10">
            {visibleAnswers.map((answer, index) => (
              <motion.article
                key={answer.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr_1.6fr_0.65fr_0.8fr] gap-4 px-5 py-5 items-start"
              >
                <div>
                  <p className="lg:hidden text-white/30 text-xs font-semibold uppercase mb-1">Question</p>
                  <p className="text-white text-sm leading-relaxed">{answer.question}</p>
                </div>

                <div>
                  <p className="lg:hidden text-white/30 text-xs font-semibold uppercase mb-1">User</p>
                  <p className="text-white/65 text-sm">{answer.creator_name}</p>
                </div>

                <div>
                  <p className="lg:hidden text-white/30 text-xs font-semibold uppercase mb-1">Answer</p>
                  <p className="text-white/55 text-sm leading-relaxed">{answer.body}</p>
                </div>

                <div>
                  <p className="lg:hidden text-white/30 text-xs font-semibold uppercase mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[answer.status]}`}>
                    {answer.status === 'pending' && <Clock3 size={12} />}
                    {answer.status === 'approved' && <Check size={12} />}
                    {answer.status === 'rejected' && <X size={12} />}
                    {answer.status}
                  </span>
                </div>

                <div className="flex lg:justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => updateStatus(answer.id, 'approved')}
                    disabled={answer.status === 'approved'}
                    className="h-9 px-3 rounded-lg inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/12 text-emerald-300 border border-emerald-400/20 hover:bg-emerald-500/20 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                  >
                    <Check size={14} />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(answer.id, 'rejected')}
                    disabled={answer.status === 'rejected'}
                    className="h-9 px-3 rounded-lg inline-flex items-center gap-1.5 text-xs font-semibold bg-rose-500/12 text-rose-300 border border-rose-400/20 hover:bg-rose-500/20 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              </motion.article>
            ))}

            {visibleAnswers.length === 0 && (
              <div className="px-5 py-16 text-center">
                <p className="text-white/60 font-medium">No answers found</p>
                <p className="text-white/35 text-sm mt-1">Try a different filter or search term.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </PageTransition>
  )
})

export default AdminPage
