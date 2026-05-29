import { memo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { HelpCircle, MessageSquare, Sword, ArrowRight, Sparkles, Megaphone, Crown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageTransition } from '../components/PageTransition'
import { useAuth } from '../context/AuthContext'
import { faqs, doubts, admin } from '../lib/api'

const PARTICLES = [
  { left: '15%', dur: '3.2s', delay: '0s' },
  { left: '30%', dur: '2.8s', delay: '0.7s' },
  { left: '55%', dur: '3.6s', delay: '1.2s' },
  { left: '75%', dur: '2.5s', delay: '0.3s' },
  { left: '88%', dur: '3.1s', delay: '1.8s' },
]

export const DashboardPage = memo(function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [faqCount, setFaqCount] = useState(0)
  const [doubtCount, setDoubtCount] = useState(0)
  const [points, setPoints] = useState(0)
  const [topUsers, setTopUsers] = useState<{ username: string; sp_points: number }[]>([])

  useEffect(() => {
    faqs.list().then(({ data }) => setFaqCount(data.items.length)).catch(() => {})
    doubts.list().then(({ data }) => setDoubtCount(data.doubts.length)).catch(() => {})
    admin.users().then(({ data }) => setTopUsers(data.users.slice(0, 5))).catch(() => {})
  }, [])

  useEffect(() => {
    if (user) {
      let start = 0
      const target = user.sp_points
      const t = setInterval(() => {
        start += Math.ceil(target / 40)
        if (start >= target) { setPoints(target); clearInterval(t) }
        else setPoints(start)
      }, 30)
      return () => clearInterval(t)
    }
  }, [user])

  const CARDS = [
    { icon: HelpCircle,     label: 'Browse FAQs',     desc: `${faqCount} articles`,        path: '/faq',    color: '#7c3aed', bg: 'bg-[#7c3aed]/10' },
    { icon: MessageSquare,  label: 'Doubt Solver',    desc: `${doubtCount} open doubts`,   path: '/doubts', color: '#06b6d4', bg: 'bg-[#06b6d4]/10' },
    { icon: Sparkles,       label: 'Leaderboard',     desc: `${user?.sp_points ?? 0} SP earned`, path: '', color: '#f59e0b', bg: 'bg-[#f59e0b]/10' },
  ]

  const CARD_VARIANTS = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    show: (i: number) => ({
      opacity: 1, y: 0, scale: 1,
      transition: { delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    }),
  } as Variants

  return (
    <PageTransition>
      <div className="px-6 py-8 max-w-5xl mx-auto">

        {/* ── Hero Banner ── */}
        <motion.div
          className="glass-card rounded-3xl p-8 mb-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Animated grid background */}
          <div className="hero-grid-bg absolute inset-0 pointer-events-none" />

          {/* Ambient glow blobs */}
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-[#7c3aed]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-1/3 w-48 h-48 bg-[#06b6d4]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Floating particles */}
          {PARTICLES.map((p, i) => (
            <span key={i} className="particle" style={{ left: p.left, bottom: '10%', '--dur': p.dur, '--delay': p.delay } as React.CSSProperties} />
          ))}

          {/* Hero gradient overlay */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, transparent 50%, rgba(6,182,212,0.08) 100%)',
            }}
          />

          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Sword size={20} className="text-[#7c3aed]" />
              <span className="text-[#7c3aed] text-xs font-semibold uppercase tracking-widest">Welcome back</span>
            </div>
            <h2 className="text-3xl text-white font-bold mb-1">{user?.username}</h2>
            <p className="text-white/40 text-sm">Your institute knowledge portal</p>
          </div>

          <div className="mt-6 flex items-center gap-6 relative">
            <div>
              <p className="text-white/30 text-xs mb-0.5">Skill Points</p>
              <p className="text-4xl font-bold text-white">{points}<span className="text-[#7c3aed] text-lg ml-1">SP</span></p>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div>
              <p className="text-white/30 text-xs mb-0.5">Role</p>
              <p className="text-white text-sm font-medium capitalize">{user?.role}</p>
            </div>

          </div>
        </motion.div>

        {/* ── Quick Access Cards (gradient border + hover glow) ── */}
        <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">
          <span className="inline-flex items-center gap-1.5">⚡ Quick Access</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              variants={CARD_VARIANTS}
              initial="hidden"
              animate="show"
              custom={i}
              className="glass-card shimmer-border rounded-2xl p-5 cursor-pointer group card-glow-hover"
              onClick={() => card.path && navigate(card.path)}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
                <card.icon size={20} style={{ color: card.color }} />
              </div>
              <h4 className="text-white font-medium text-sm mb-0.5">{card.label}</h4>
              <p className="text-white/30 text-xs">{card.desc}</p>
              <ArrowRight size={16} className="text-white/20 mt-3 group-hover:text-[#7c3aed] transition-colors" />
            </motion.div>
          ))}
        </div>

        {/* ── Leaderboard ── */}
        <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4 mt-8">
          <span className="inline-flex items-center gap-1.5"><Crown size={12} className="text-[#FFD700]" /> Top Community Members</span>
        </h3>
        <div className="glass-card shimmer-border rounded-2xl p-5">
          {/* Crown header bar */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
            <Crown size={14} className="text-[#FFD700]" />
            <span className="text-white/60 text-xs font-medium">Hall of Fame</span>
          </div>
          {topUsers.map((u, i) => (
            <motion.div key={u.username}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.08, duration: 0.3, ease: 'backOut' }}
              className={`flex items-center gap-3 py-2.5 rounded-xl px-2 transition-colors ${
                i === 0 ? 'glow-gold' : i === 1 ? 'glow-silver' : i === 2 ? 'glow-bronze' : ''
              } ${i !== 0 ? 'mt-0.5' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i === 0 ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/50' :
                i === 1 ? 'bg-[#C0C0C0]/20 text-[#C0C0C0] border border-[#C0C0C0]/50' :
                i === 2 ? 'bg-[#CD7F32]/20 text-[#CD7F32] border border-[#CD7F32]/50' :
                'bg-white/5 text-white/40'
              }`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </div>
              <span className="text-white text-sm flex-1">{u.username}</span>
              <span className="text-[#7c3aed] text-sm font-semibold">{u.sp_points} SP</span>
            </motion.div>
          ))}
        </div>

      </div>
    </PageTransition>
  )
})

export default DashboardPage