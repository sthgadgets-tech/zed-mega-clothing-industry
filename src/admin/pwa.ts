// Admin PWA: installable app (manifest scoped to /admin) plus push notifications
// for new quote requests. The service worker lives at /admin-sw.js.

import { getToken } from './auth'

const SW_URL = '/admin-sw.js'
const SW_SCOPE = '/admin'

export type PushState = 'unsupported' | 'needs-install' | 'denied' | 'off' | 'on'
export type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

// Chrome fires this once, often before the dashboard mounts, so keep it until a page asks.
let pendingInstall: InstallPrompt | null = null
const installListeners = new Set<(prompt: InstallPrompt | null) => void>()
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    pendingInstall = event as InstallPrompt
    installListeners.forEach((listener) => listener(pendingInstall))
  })
  window.addEventListener('appinstalled', () => {
    pendingInstall = null
    installListeners.forEach((listener) => listener(null))
  })
}

export function onInstallPrompt(listener: (prompt: InstallPrompt | null) => void) {
  listener(pendingInstall)
  installListeners.add(listener)
  return () => { installListeners.delete(listener) }
}

export function clearInstallPrompt() {
  pendingInstall = null
  installListeners.forEach((listener) => listener(null))
}

// index.html is shared with the public site, so the admin manifest is attached only on admin pages.
export function setupAdminPwa() {
  const head = document.head
  const add = (tag: string, attrs: Record<string, string>) => {
    if (head.querySelector(`${tag}[data-admin-pwa="${attrs.rel ?? attrs.name}"]`)) return
    const el = document.createElement(tag)
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value))
    el.setAttribute('data-admin-pwa', attrs.rel ?? attrs.name)
    head.appendChild(el)
  }
  add('link', { rel: 'manifest', href: '/admin.webmanifest' })
  add('link', { rel: 'apple-touch-icon', href: '/admin-icons/apple-touch-icon.png' })
  add('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' })
  add('meta', { name: 'mobile-web-app-capable', content: 'yes' })
  add('meta', { name: 'apple-mobile-web-app-title', content: 'ZED Admin' })
  add('meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' })
  if ('serviceWorker' in navigator) navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE }).catch(() => {})
}

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true

async function registration() {
  return navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE }).then(() => navigator.serviceWorker.ready)
}

export async function getPushState(): Promise<PushState> {
  // iPhone only allows web push for apps added to the Home Screen.
  if (isIos() && !isStandalone()) return 'needs-install'
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  const reg = await navigator.serviceWorker.getRegistration(SW_SCOPE)
  const sub = await reg?.pushManager.getSubscription()
  return sub && Notification.permission === 'granted' ? 'on' : 'off'
}

function authFetch(url: string, init: RequestInit = {}) {
  return fetch(url, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken() ?? ''}`, ...init.headers } })
}

async function errorFrom(response: Response, fallback: string) {
  const data = (await response.json().catch(() => ({}))) as { error?: string }
  return new Error(data.error || fallback)
}

function keyToBytes(base64: string) {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
}

export async function enablePush() {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Notifications were blocked. Allow them in your browser settings.')
  const keyResponse = await fetch('/api/push')
  if (!keyResponse.ok) throw await errorFrom(keyResponse, 'Notifications are not available right now.')
  const { publicKey } = (await keyResponse.json()) as { publicKey: string }
  const reg = await registration()
  const subscription = (await reg.pushManager.getSubscription()) ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(publicKey) })
  const response = await authFetch('/api/push', { method: 'POST', body: JSON.stringify({ subscription: subscription.toJSON() }) })
  if (!response.ok) throw await errorFrom(response, 'Could not turn on notifications.')
}

export async function disablePush() {
  const reg = await navigator.serviceWorker.getRegistration(SW_SCOPE)
  const subscription = await reg?.pushManager.getSubscription()
  if (!subscription) return
  await authFetch('/api/push', { method: 'DELETE', body: JSON.stringify({ endpoint: subscription.endpoint }) }).catch(() => {})
  await subscription.unsubscribe()
}

export async function sendTestPush() {
  const response = await authFetch('/api/push?action=test', { method: 'POST' })
  if (!response.ok) throw await errorFrom(response, 'Could not send a test notification.')
}
