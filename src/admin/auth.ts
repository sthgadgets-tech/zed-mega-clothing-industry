// Browser-side sign-in gate for the local admin preview.
// The credentials below ship inside the JavaScript bundle, so anyone who opens the
// site source can read them. This keeps casual visitors out of /admin in this
// browser. It does not protect data, and it must not be used for real content
// management. Use Supabase Auth or another server-verified login before going live.

export const ADMIN_USERNAME = 'admin'
export const ADMIN_PASSWORD = 'admin123'

const SESSION_KEY = 'zedmega-admin-session'

export function isSignedIn(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === 'active'
  } catch {
    return false
  }
}

export function signIn(username: string, password: string): boolean {
  if (username.trim() !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return false
  try {
    window.sessionStorage.setItem(SESSION_KEY, 'active')
  } catch {
    return false
  }
  return true
}

export function signOut(): void {
  try {
    window.sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}
