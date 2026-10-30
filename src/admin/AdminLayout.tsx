import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { signOut } from './auth'
import { AlertTriangle, ArrowLeft, FolderKanban, HelpCircle, Home, Image, LayoutDashboard, LogOut, Menu, RotateCcw, Save, Settings, X } from 'lucide-react'
import { clearDraft, loadDraft, saveDraft } from './localDraftStore'
import { cloneInitialContent } from './mockContent'
import type { SiteContent } from './types'
import './admin.css'

export type AdminContextValue = {
  content: SiteContent
  updateContent: (next: SiteContent) => void
  save: () => boolean
  reset: () => void
  saved: boolean
}

// Pages read editor state through this hook. It is provided by the outlet context,
// so there is no global state.
export function useAdmin(): AdminContextValue {
  return useOutletContext<AdminContextValue>()
}

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/homepage', label: 'Homepage', icon: Home, end: false },
  { to: '/admin/categories', label: 'Categories', icon: FolderKanban, end: false },
  { to: '/admin/media', label: 'Media library', icon: Image, end: false },
  { to: '/admin/faq', label: 'FAQs & blog', icon: HelpCircle, end: false },
  { to: '/admin/settings', label: 'Site settings', icon: Settings, end: false },
]

function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
    <div className="admin-sidebar-brand">
      <img src="/images/zedmega-logo.jpg" alt="" width={36} height={36} />
      <div><strong>ZED MEGA</strong><small>CONTENT STUDIO</small></div>
      <button type="button" className="admin-icon-button admin-sidebar-close" onClick={onClose} aria-label="Close menu"><X size={19} /></button>
    </div>
    <p className="admin-nav-label">WORKSPACE</p>
    <nav className="admin-nav" aria-label="Admin">
      {navItems.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? 'is-active' : ''}><Icon size={17} /><span>{label}</span></NavLink>)}
    </nav>
    <div className="admin-sidebar-bottom"><span className="admin-demo-dot" />Local preview mode</div>
  </aside>
}

export function AdminLayout() {
  const [content, setContent] = useState<SiteContent>(loadDraft)
  const [saved, setSaved] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Close the mobile menu after navigation.
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const current = navItems.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)))

  const handleSignOut = () => {
    if (!saved && !window.confirm('You have unsaved changes. Sign out anyway? Unsaved edits will be lost.')) return
    signOut()
    navigate('/admin/login', { replace: true })
  }

  const context: AdminContextValue = {
    content,
    saved,
    updateContent: (next) => { setContent(next); setSaved(false) },
    save: () => {
      const ok = saveDraft(content)
      if (ok) setSaved(true)
      return ok
    },
    reset: () => {
      if (!window.confirm('Discard this browser’s local draft and restore the starter demo data?')) return
      clearDraft()
      setContent(cloneInitialContent())
      setSaved(true)
    },
  }

  return <div className="admin-app">
    <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    {menuOpen && <button type="button" className="admin-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
    <div className="admin-main">
      <header className="admin-topbar">
        <button type="button" className="admin-icon-button admin-menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
        <div className="admin-breadcrumb"><span>Workspace</span> / <strong>{current?.label ?? 'Editor'}</strong></div>
        <a className="admin-back-link" href="/"><ArrowLeft size={15} /><span>View website</span></a>
        <button type="button" className="admin-button admin-button-secondary admin-signout" onClick={handleSignOut}><LogOut size={15} /> Sign out</button>
      </header>
      <div className="admin-warning" role="note">
        <AlertTriangle size={18} />
        <span><strong>Local preview only.</strong> The sign-in is a browser-side gate, not server security. There is no cloud persistence or public publishing. Drafts are stored in this browser only.</span>
      </div>
      <main className="admin-content"><Outlet context={context} /></main>
      <footer className="admin-footer"><span>Demo data · Browser local storage</span><span>Not connected to the public website</span></footer>
    </div>
  </div>
}

export function AdminPageHeader({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description: string; children?: ReactNode }) {
  return <div className="admin-page-header">
    <div>
      {eyebrow && <p className="admin-eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    {children}
  </div>
}

export function AdminSaveBar() {
  const { save, reset, saved } = useAdmin()
  const [message, setMessage] = useState('')

  return <div className="admin-save-bar">
    <span className={`admin-save-state ${saved ? '' : 'is-unsaved'}`} role="status">{saved ? 'All changes saved in this browser' : 'Unsaved changes'}</span>
    <div className="admin-save-actions">
      <button type="button" className="admin-button admin-button-quiet" onClick={() => { reset(); setMessage('') }}><RotateCcw size={15} /> Reset demo data</button>
      <button type="button" className="admin-button admin-button-primary" onClick={() => setMessage(save() ? 'Draft saved in this browser only.' : 'Could not save. Browser storage may be unavailable.')}><Save size={15} /> Save draft</button>
    </div>
    {message && <p className="admin-action-message" role="status">{message}</p>}
  </div>
}
