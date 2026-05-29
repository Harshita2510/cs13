import { useState, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import { Sword, Loader2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { demoCredentials } from '../lib/mockStore'

const C = {
  accent: '#7c3aed',
  cyan: '#06b6d4',
  text: '#f1f5f9',
  textDim: 'rgba(148,163,184,0.55)',
  textMuted: 'rgba(148,163,184,0.3)',
  cardBg: 'rgba(10, 8, 28, 0.88)',
  border: 'rgba(139, 92, 246, 0.2)',
}

export const LoginPage = memo(function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return
    setLoading(true)
    const result = await login(username, password)
    if (result.error) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success(result.user?.role === 'admin' ? 'Welcome back, admin!' : 'Welcome back!')
      navigate(result.user?.role === 'admin' ? '/admin' : '/doubts')
    }
  }, [username, password, login, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute"
          style={{
            width: 600, height: 600,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 65%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute"
          style={{
            width: 400, height: 400,
            top: '30%', right: '15%',
            background: 'radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 65%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Login card */}
      <motion.div
        className="glass-card shimmer-border rounded-3xl p-8 sm:p-10 w-full max-w-lg relative"
        animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.55 }}
        style={{ borderColor: 'rgba(139,92,246,0.25)' }}
      >
        {/* Logo */}
        <motion.div
          className="flex flex-col items-center mb-10"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 18 }}
            className="relative"
          >
            {/* Glow ring behind logo */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'radial-gradient(ellipse, rgba(124,58,237,0.25) 0%, transparent 70%)',
                transform: 'scale(1.4)',
                filter: 'blur(12px)',
              }}
            />
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))',
                border: '1px solid rgba(139,92,246,0.4)',
                boxShadow: '0 0 30px rgba(124,58,237,0.3), 0 4px 16px rgba(0,0,0,0.3)',
              }}
            >
              <Sword size={32} style={{ color: '#a78bfa' }} />
            </div>
          </motion.div>

          <motion.h1
            className="text-2xl font-bold mt-5"
            style={{ color: C.text }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            Zoro Portal
          </motion.h1>
          <motion.p
            className="text-sm mt-1.5 text-center leading-relaxed max-w-xs"
            style={{ color: C.textDim }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            Sign in as an admin or student to test the doubt workflow.
          </motion.p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wider uppercase" style={{ color: C.textDim }}>
              Email
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin@example.com"
              className="cosmic-input"
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wider uppercase" style={{ color: C.textDim }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="cosmic-input"
              autoComplete="current-password"
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading || !username || !password}
            className="cosmic-btn-primary w-full mt-2"
            style={{ fontSize: '15px', padding: '14px 24px' }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={17} />
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Demo credentials */}
        <motion.div
          className="mt-8 rounded-2xl p-4 text-center"
          style={{
            background: 'rgba(139,92,246,0.06)',
            border: '1px solid rgba(139,92,246,0.12)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: C.textMuted }}>
            Demo Credentials
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {demoCredentials.map(cred => (
              <button
                key={cred.email}
                type="button"
                onClick={() => { setUsername(cred.email); setPassword(cred.password) }}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] text-left"
                style={{
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  color: 'rgba(199,179,255,0.75)',
                }}
              >
                <span className="block text-white/80">{cred.label}</span>
                <span className="block text-white/30 mt-0.5 truncate">{cred.role}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Footer tagline */}
        <motion.p
          className="text-center text-xs mt-6"
          style={{ color: 'rgba(148,163,184,0.2)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Frontend-only demo · Ready for backend integration
        </motion.p>
      </motion.div>
    </div>
  )
})

export default LoginPage
