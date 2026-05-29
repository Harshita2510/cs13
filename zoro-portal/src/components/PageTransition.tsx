import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

const variants = {
  initial: { opacity: 0, y: 20 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.25 } },
} as const

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={variants} initial="initial" animate="enter" exit="exit" className="min-h-[calc(100vh-64px)]">
      {children}
    </motion.div>
  )
}