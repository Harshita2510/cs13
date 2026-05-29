import { useState, useEffect } from 'react'

export function useTypewriter(text: string, speed = 40) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const tick = () => {
      if (i < text.length) {
        setDisplayed(text.slice(0, ++i))
        setTimeout(tick, speed)
      } else setDone(true)
    }
    const t = setTimeout(tick, 300)
    return () => clearTimeout(t)
  }, [text, speed])
  return { displayed, done }
}