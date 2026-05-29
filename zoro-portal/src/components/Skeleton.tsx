import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface SkeletonProps { lines?: number }
export function Skeleton({ lines = 3 }: SkeletonProps) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div key={i} className="skeleton-shimmer rounded-lg h-4"
          animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          style={{ width: `${85 - i * 7}%` }} />
      ))}
    </div>
  )
}

interface ListSkeletonProps { count?: number }
export function ListSkeleton({ count = 5 }: ListSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card rounded-2xl p-5 space-y-2">
          <motion.div className="skeleton-shimmer rounded h-3 w-1/3"
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.07 }} />
          <motion.div className="skeleton-shimmer rounded h-4 w-4/5"
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.09 + 0.1 }} />
          <motion.div className="skeleton-shimmer rounded h-3 w-2/3"
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.09 + 0.2 }} />
        </div>
      ))}
    </div>
  )
}