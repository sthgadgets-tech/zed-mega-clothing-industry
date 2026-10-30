// Singleton Intro Audio Controller for ZED MEGA

const AUDIO_SRC = '/audio/zedmega-intro.mp3'

let audioInstance: HTMLAudioElement | null = null
let hasStarted = false
let listenersAttached = false

function getAudio(): HTMLAudioElement {
  if (!audioInstance) {
    const existing = document.getElementById('zedmega-intro-audio') as HTMLAudioElement | null
    if (existing) {
      audioInstance = existing
    } else {
      audioInstance = new Audio(AUDIO_SRC)
      audioInstance.id = 'zedmega-intro-audio'
      audioInstance.preload = 'auto'
      document.body.appendChild(audioInstance)
    }
    audioInstance.volume = 1
    audioInstance.playbackRate = 1.22
    audioInstance.preservesPitch = true
  }
  return audioInstance
}

const interactionEvents = ['pointerdown', 'mousedown', 'mouseup', 'click', 'touchstart', 'touchend', 'keydown']

function onUserGesture() {
  if (hasStarted) {
    detachGestureListeners()
    return
  }
  const audio = getAudio()
  audio.currentTime = 0
  audio.playbackRate = 1.22
  audio.preservesPitch = true
  audio
    .play()
    .then(() => {
      hasStarted = true
      detachGestureListeners()
    })
    .catch((err) => {
      console.warn('[ZED MEGA Audio] Play attempt failed on gesture:', err)
    })
}

function attachGestureListeners() {
  if (listenersAttached || hasStarted) return
  listenersAttached = true
  for (const eventName of interactionEvents) {
    window.addEventListener(eventName, onUserGesture, { capture: true, passive: true })
    document.addEventListener(eventName, onUserGesture, { capture: true, passive: true })
  }
}

function detachGestureListeners() {
  listenersAttached = false
  for (const eventName of interactionEvents) {
    window.removeEventListener(eventName, onUserGesture, { capture: true })
    document.removeEventListener(eventName, onUserGesture, { capture: true })
  }
}

export function getIntroAudio(): HTMLAudioElement {
  return getAudio()
}

export function startIntroAudio() {
  hasStarted = false
  const audio = getAudio()
  audio.currentTime = 0
  audio.playbackRate = 1.22
  audio.preservesPitch = true

  const playPromise = audio.play()
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        hasStarted = true
        detachGestureListeners()
      })
      .catch((error) => {
        // Browser autoplay policy prevented unprompted playback.
        // Listen for any user gesture (click, tap, key) to play immediately.
        console.warn('[ZED MEGA Audio] Autoplay blocked by browser policy; waiting for user gesture:', error)
        attachGestureListeners()
      })
  }
}
