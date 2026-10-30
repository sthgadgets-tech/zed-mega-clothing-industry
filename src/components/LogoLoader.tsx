import { useEffect, useState } from 'react'
import { getIntroAudio, startIntroAudio } from '../lib/introAudio'
import './logo-loader.css'

const BRAND_LABEL = 'ZED MEGA'
const MESSAGE = 'UNLEASHING THE LION'
const TAGLINE = 'STRENGTH · ELEGANCE · LEGACY'
const LOGO_SRC = '/images/zedmega-logo.webp'
const LOADER_DURATION_MS = 3000 // Fallback when the intro sound can't play
const EXIT_MS = 600
const RING_RADIUS = 94
const RING_LENGTH = 100

type Phase = 'loading' | 'exit' | 'done'

// The intro plays once per browser; returning visitors go straight to the site.
const SEEN_KEY = 'zedmega-intro-seen'
function hasSeenIntro() {
  try { return localStorage.getItem(SEEN_KEY) === '1' } catch { return false }
}

export function LogoLoader() {
  const [phase, setPhase] = useState<Phase>(() => hasSeenIntro() ? 'done' : 'loading')
  const [progress, setProgress] = useState(1)

  useEffect(() => {
    if (phase === 'done') return
    try { localStorage.setItem(SEEN_KEY, '1') } catch { /* storage blocked: intro just plays again */ }
    document.body.classList.add('is-loading')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const startedAt = performance.now()
    let frameId = 0
    let finishTimer = 0
    let cancelled = false
    let finished = false

    const finish = () => {
      if (cancelled || finished) return
      finished = true
      setProgress(100)
      finishTimer = window.setTimeout(() => {
        if (!cancelled) setPhase('exit')
      }, reducedMotion ? 200 : 350)
    }

    // Trigger audio intro immediately
    startIntroAudio()
    const audio = getIntroAudio()
    audio.addEventListener('ended', finish)
    let lastRatio = 0

    const animate = (now: number) => {
      if (cancelled || finished) return

      // While the intro sound plays, progress follows it so 100% lands as it ends.
      // If autoplay is blocked, fall back to a timer so the loader never stalls.
      const audioPlaying = !audio.paused && Number.isFinite(audio.duration) && audio.duration > 0
      const ratio = audioPlaying
        ? audio.currentTime / audio.duration
        : (now - startedAt) / LOADER_DURATION_MS
      lastRatio = Math.min(1, Math.max(lastRatio, ratio))

      setProgress(Math.max(1, Math.round(1 + lastRatio * 99)))

      if (lastRatio >= 1 && (!audioPlaying || audio.ended)) {
        finish()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => {
      cancelled = true
      audio.removeEventListener('ended', finish)
      document.body.classList.remove('is-loading')
      cancelAnimationFrame(frameId)
      window.clearTimeout(finishTimer)
    }
  }, [])

  useEffect(() => {
    if (phase !== 'exit') return
    const exitDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 300 : EXIT_MS
    const timer = window.setTimeout(() => {
      document.body.classList.remove('is-loading')
      setPhase('done')
    }, exitDuration)
    return () => window.clearTimeout(timer)
  }, [phase])

  if (phase === 'done') return null

  const percent = Math.floor(progress)
  const dashOffset = RING_LENGTH - progress
  const activeTicks = Math.round(progress * 0.6)

  return (
    <div
      className={`logo-loader logo-loader-${phase}`}
      onClick={startIntroAudio}
      onPointerDown={startIntroAudio}
      role="progressbar"
      aria-label="Loading ZED MEGA"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <div className="logo-loader-stage">
        <div className="logo-loader-halo" />
        <div className="logo-loader-mark"><img src={LOGO_SRC} alt="ZED MEGA" width={512} height={512} decoding="async" /></div>
        <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">
          <defs><linearGradient id="logo-loader-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" /><stop offset=".5" stopColor="#8fb0ff" /><stop offset="1" stopColor="#2f6bff" /></linearGradient></defs>
          <g className="logo-loader-ticks">{Array.from({ length: 60 }, (_, index) => {
            const angle = index * 6 * Math.PI / 180
            const inner = index % 5 ? 97.5 : 98
            const outer = index % 5 ? 100 : 102.5
            return <line key={index} className={index < activeTicks ? 'is-active' : undefined} x1={100 + inner * Math.sin(angle)} y1={100 - inner * Math.cos(angle)} x2={100 + outer * Math.sin(angle)} y2={100 - outer * Math.cos(angle)} />
          })}</g>
          <circle className="logo-loader-track" cx="100" cy="100" r={RING_RADIUS} />
          <g transform="rotate(-90 100 100)">
            <circle className="logo-loader-glow" cx="100" cy="100" r={RING_RADIUS} pathLength={RING_LENGTH} strokeDasharray={RING_LENGTH} strokeDashoffset={dashOffset} />
            <circle className="logo-loader-progress" cx="100" cy="100" r={RING_RADIUS} pathLength={RING_LENGTH} strokeDasharray={RING_LENGTH} strokeDashoffset={dashOffset} />
            <g transform={`rotate(${progress * 3.6} 100 100)`}><circle className="logo-loader-head-glow" cx="194" cy="100" r="6" /><circle className="logo-loader-head" cx="194" cy="100" r="2.6" /></g>
          </g>
        </svg>
      </div>
      <p className="logo-loader-brand">{BRAND_LABEL}</p>
      <div className="logo-loader-meta"><span>{MESSAGE}</span><strong>{String(percent).padStart(2, '0')}%</strong></div>
      <p className="logo-loader-tag"><span />{TAGLINE}<span /></p>
      <p className="logo-loader-foot">© 2026 ZED MEGA · ALL RIGHTS RESERVED</p>
    </div>
  )
}
