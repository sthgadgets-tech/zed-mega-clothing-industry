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
    audioInstance.playbackRate = 1
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
  audio.playbackRate = 1
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

// Resolves true when the sound is playing, false when the browser blocked it
// (phones do this until the visitor taps; the first tap then starts it).
export function startIntroAudio(): Promise<boolean> {
  const audio = getAudio()
  if (hasStarted && !audio.paused) return Promise.resolve(true)
  hasStarted = false
  audio.currentTime = 0
  audio.playbackRate = 1
  audio.preservesPitch = true

  return audio.play()
    .then(() => {
      hasStarted = true
      detachGestureListeners()
      return true
    })
    .catch(() => {
      attachGestureListeners()
      return false
    })
}

// Called when the intro ends: stop waiting for a tap so browsing never triggers the sound.
export function cancelIntroAudioWait() {
  detachGestureListeners()
  hasStarted = true
}
