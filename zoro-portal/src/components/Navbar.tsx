import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, BarChart3, LogOut, Sword, Bell, X, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { admin } from '../lib/api'
import type { Announcement } from '../types'

const READ_KEY = 'zoro_ann_read'

export function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null)
  const [readIds, setReadIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    admin.announcements().then(({ data }) => setAnnouncements(data.announcements)).catch(() => {})
    try {
      const saved = JSON.parse(localStorage.getItem(READ_KEY) ?? '[]')
      setReadIds(new Set(saved))
    } catch {}
  }, [])

  const markRead = useCallback((id: number) => {
    setReadIds(prev => {
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem(READ_KEY, JSON.stringify([...next]))
      return next
    })
  }, [])

  const handleOpenAnn = useCallback((a: Announcement) => {
    markRead(a.id)
    setSelectedAnn(a)
  }, [markRead])

  const unreadCount = announcements.filter(a => !readIds.has(a.id)).length

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <div className="sticky top-0 z-50">
      {/* Announcement ticker strip */}
      {announcements.length > 0 && (
        <div
          className="overflow-hidden h-8 flex items-center"
          style={{ background: 'rgba(6,182,212,0.07)', borderBottom: '1px solid rgba(6,182,212,0.15)', borderLeft: '3px solid #06b6d4' }}
        >
          <span className="flex-shrink-0 pl-3 pr-2 text-[#06b6d4]"><Bell size={12} /></span>
          <div className="overflow-hidden flex-1">
            <div
              className="flex gap-14"
              style={{ animation: 'scroll-ticker 40s linear infinite', width: 'max-content' }}
            >
              {[...announcements, ...announcements].map((a, i) => (
                <span key={i} className="text-white/50 text-xs whitespace-nowrap pr-14">
                  <span className="text-white/75 font-medium mr-2">{a.title}</span>
                  <span>{a.body.slice(0, 55)}{a.body.length > 55 ? '…' : ''}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main navbar */}
      <nav className="glass-nav border-b border-[#06b6d4]/15" style={{ background: 'rgba(10,10,18,0.97)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-2">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 mr-4 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(124,58,237,0.2))',
                border: '1px solid rgba(6,182,212,0.3)',
                boxShadow: '0 0 12px rgba(6,182,212,0.15)',
              }}
            >
              <Sword size={17} className="text-[#06b6d4]" />
            </div>
            <span className="text-white font-bold text-sm tracking-wide">Zoro Portal</span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1 flex-1">
            {/* Dashboard */}
            <Link to="/dashboard" className="nav-link group">
              <Home size={16} className={location.pathname === '/dashboard' ? 'text-[#06b6d4]' : 'text-white/40 group-hover:text-white/70'} />
              <span className={location.pathname === '/dashboard' ? 'text-white' : 'text-white/40 group-hover:text-white/80'}>Dashboard</span>
              {location.pathname === '/dashboard' && <motion.div layoutId="nav-pill" className="nav-pill-active" />}
            </Link>

            {/* Announcements — dropdown trigger */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(v => !v)}
                className={`nav-link group ${showDropdown ? 'nav-link-active' : ''}`}
              >
                <div className="relative">
                  <Bell size={18} className={showDropdown ? 'text-[#06b6d4]' : 'text-white/40 group-hover:text-[#06b6d4]'} />
                  {unreadCount > 0 && (
                    <motion.span
                      key={unreadCount}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                        boxShadow: '0 0 8px rgba(6,182,212,0.7)',
                        color: '#fff',
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </div>
                <span className={showDropdown ? 'text-white' : 'text-white/40 group-hover:text-white/80'}>Announcements</span>
                {showDropdown && <motion.div layoutId="nav-pill-announce" className="nav-pill-active" />}
              </button>

              {/* Dropdown panel */}
              <AnimatePresence>
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-80 rounded-2xl overflow-hidden z-50"
                      style={{
                        background: 'rgba(12,12,22,0.98)',
                        border: '1px solid rgba(6,182,212,0.3)',
                        boxShadow: '0 8px 40px rgba(6,182,212,0.15), 0 2px 8px rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(24px)',
                      }}
                    >
                      <div className="px-4 py-3 border-b border-[#06b6d4]/10 flex items-center justify-between">
                        <p className="text-white/30 text-xs font-semibold uppercase tracking-widest">Announcements</p>
                        {unreadCount > 0 && (
                          <span className="text-[#06b6d4] text-xs font-semibold">{unreadCount} new</span>
                        )}
                      </div>
                      <div className="py-1 max-h-80 overflow-y-auto">
                        {announcements.map(a => (
                          <button
                            key={a.id}
                            onClick={() => handleOpenAnn(a)}
                            className="w-full text-left px-4 py-3 hover:bg-[#06b6d4]/8 transition-colors border-b border-[#06b6d4]/5 last:border-0 flex items-start gap-3"
                          >
                            {/* Unread dot */}
                            <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 transition-all ${readIds.has(a.id) ? 'bg-white/10' : 'bg-[#06b6d4]'}`}
                              style={!readIds.has(a.id) ? { boxShadow: '0 0 6px rgba(6,182,212,0.7)' } : {}} />

                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium mb-0.5 leading-tight">{a.title}</p>
                              <p className="text-white/35 text-xs leading-relaxed line-clamp-2">{a.body}</p>
                              <p className="text-white/20 text-xs mt-1">{new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>

                            {readIds.has(a.id) && (
                              <Check size={12} className="text-white/20 flex-shrink-0 mt-1" />
                            )}
                          </button>
                        ))}
                      </div>
                      {announcements.length === 0 && (
                        <div className="px-4 py-8 text-center text-white/30 text-sm">No announcements yet</div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            {user?.role === 'admin' && (
              <Link to="/admin-x9k2" className="nav-link group">
                <BarChart3 size={16} className="text-white/40 group-hover:text-[#06b6d4]" />
                <span className="text-white/40 group-hover:text-white/80">Admin</span>
                {location.pathname === '/admin-x9k2' && <motion.div layoutId="nav-pill-admin" className="nav-pill-active" />}
              </Link>
            )}

            <div className="flex items-center gap-2.5 pl-2 border-l border-[#06b6d4]/15">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(124,58,237,0.25))',
                  border: '1px solid rgba(6,182,212,0.3)',
                  boxShadow: '0 0 10px rgba(6,182,212,0.15)',
                  color: '#06b6d4',
                }}
              >
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-white text-xs font-medium leading-none">{user?.username}</p>
                <p className="text-[#06b6d4] text-xs font-semibold mt-0.5">{user?.sp_points} SP</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* Full announcement modal */}
      <AnimatePresence>
        {selectedAnn && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
              onClick={() => setSelectedAnn(null)}
            >
              <motion.div
                key="modal"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-lg rounded-3xl overflow-hidden"
                style={{
                  background: 'rgba(14,14,24,0.98)',
                  border: '1px solid rgba(6,182,212,0.3)',
                  boxShadow: '0 0 60px rgba(6,182,212,0.15), 0 24px 60px rgba(0,0,0,0.7)',
                }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header strip */}
                <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #7c3aed)' }} />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.2))',
                          border: '1px solid rgba(6,182,212,0.3)',
                        }}
                      >
                        <Bell size={18} className="text-[#06b6d4]" />
                      </div>
                      <div>
                        <h2 className="text-white font-semibold text-base leading-tight">{selectedAnn.title}</h2>
                        <p className="text-white/30 text-xs mt-0.5">
                          {selectedAnn.creator_name} · {new Date(selectedAnn.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedAnn(null)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="bg-white/[0.03] rounded-2xl p-4 mb-4">
                    <p className="text-white/70 text-sm leading-relaxed">{selectedAnn.body}</p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => setSelectedAnn(null)}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white transition-all hover:bg-white/5"
                      style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <Check size={14} className="text-[#06b6d4]" /> Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}