// Admin sign-in. Credentials are checked on the server by /api/admin-login against
// the ADMIN_USERNAME and ADMIN_PASSWORD environment variables; nothing secret ships
// in this bundle. The browser only keeps the signed session token it gets back.

const SESSION_KEY = 'zedmega-admin-session'

export function getToken(): string | null {
  try {
    const token = window.sessionStorage.getItem(SESSION_KEY)
    if (!token || Number(token.split('.')[0]) < Date.now()) return null
    return token
  } catch {
    return null
  }
}

export function isSignedIn(): boolean {
  return getToken() !== null
}

export async function signIn(username: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  let response: Response
  try {
    response = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    })
  } catch {
    return { ok: false, error: 'Could not reach the server. Check your connection.' }
  }
  const data = (await response.json().catch(() => ({}))) as { token?: string; error?: string }
  if (!response.ok || !data.token) return { ok: false, error: data.error || 'Sign-in failed.' }
  try {
    window.sessionStorage.setItem(SESSION_KEY, data.token)
  } catch {
    return { ok: false, error: 'This browser blocked session storage.' }
  }
  return { ok: true }
}

export function signOut(): void {
  try {
    window.sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}
