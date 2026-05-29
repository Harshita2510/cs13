import { useCallback } from 'react'

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#ef4444']

export function useConfetti() {
  return useCallback(() => {
    for (let i = 0; i < 50; i++) {
      const el = document.createElement('div')
      el.className = 'confetti-particle'
      el.style.left = Math.random() * 100 + 'vw'
      el.style.background = COLORS[Math.floor(Math.random() * COLORS.length)]
      el.style.animationDelay = Math.random() * 0.8 + 's'
      el.style.animationDuration = (Math.random() * 1 + 1.5) + 's'
      document.body.appendChild(el)
      el.addEventListener('animationend', () => el.remove())
    }
  }, [])
}