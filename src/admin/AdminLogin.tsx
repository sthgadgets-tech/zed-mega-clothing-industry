import { useState, type FormEvent, type ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, ShieldAlert } from 'lucide-react'
import { isSignedIn, signIn } from './auth'
import './admin-login.css'

// Sends visitors who are not signed in to the login page, and remembers the
// page they asked for so sign-in can return them there.
export function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation()
  if (!isSignedIn()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}

export function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const requested = (location.state as { from?: string } | null)?.from
  const destination = requested && requested.startsWith('/admin') && requested !== '/admin/login' ? requested : '/admin'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  if (isSignedIn()) return <Navigate to="/admin" replace />

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!username.trim() || !password) {
      setError('Enter your username and password.')
      return
    }
    if (!signIn(username, password)) {
      setError('Incorrect username or password.')
      setPassword('')
      return
    }
    navigate(destination, { replace: true })
  }

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={submit} noValidate>
        <div className="admin-login-brand">
          <img src="/images/zedmega-logo.jpg" alt="" width={44} height={44} />
          <div>
            <strong>ZED MEGA</strong>
            <small>CONTENT STUDIO</small>
          </div>
        </div>
        <h1>Sign in</h1>
        <p className="admin-login-note">Local preview sign-in. It is a browser-side gate, not secure server authentication.</p>

        <label className="admin-field">
          <span>Username</span>
          <input name="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} aria-invalid={!!error} autoFocus />
        </label>

        <label className="admin-field">
          <span>Password</span>
          <span className="admin-password-row">
            <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={!!error} />
            <button type="button" className="admin-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
        </label>

        {error && <p className="admin-login-error" role="alert"><ShieldAlert size={15} /> {error}</p>}

        <button type="submit" className="admin-button admin-button-primary admin-login-submit"><LockKeyhole size={16} /> Sign in</button>
      </form>
    </main>
  )
}
