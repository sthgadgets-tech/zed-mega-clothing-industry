import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

const RADIUS = 22
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Floating "back to top" button with a ring that fills as the page scrolls.
export function ScrollToTop() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [])

  const toTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })

  return (
    <button type="button" className={`scroll-top ${progress > 0.08 ? 'is-visible' : ''}`} onClick={toTop} aria-label="Scroll to top">
      <svg viewBox="0 0 50 50" aria-hidden="true">
        <circle cx="25" cy="25" r={RADIUS} className="scroll-top-track" />
        <circle cx="25" cy="25" r={RADIUS} className="scroll-top-bar" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={CIRCUMFERENCE * (1 - progress)} />
      </svg>
      <ArrowUp size={18} />
    </button>
  )
}
