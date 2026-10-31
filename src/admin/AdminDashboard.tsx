import { ArrowRight, FileText, Image, Layers3, Shirt } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAdmin } from './AdminLayout'
import { AdminNotifications } from './AdminNotifications'
import { HOMEPAGE_SECTION_KEYS, SECTION_LABELS } from './types'

export function AdminDashboard() {
  const { content } = useAdmin()
  const sections = HOMEPAGE_SECTION_KEYS.length
  const enabled = HOMEPAGE_SECTION_KEYS.reduce((total, key) => {
    const value = content[key]
    if (Array.isArray(value)) return total + value.filter((item) => 'enabled' in item && item.enabled).length
    return total + 1
  }, 0)
  const total = HOMEPAGE_SECTION_KEYS.reduce((count, key) => {
    const value = content[key]
    return count + (Array.isArray(value) ? value.length : 1)
  }, 0)
  const publishedTestimonials = content.testimonials.filter((item) => item.enabled && item.verified).length
  const published = enabled - content.testimonials.filter((item) => item.enabled && !item.verified).length
  const draft = total - enabled
  const sportswear = content.categories.filter((item) => item.group === 'sportswear').length
  const activewear = content.categories.filter((item) => item.group === 'activewear').length

  const stats = [
    { label: 'Homepage sections', value: sections, detail: 'Available to edit', icon: Layers3, tone: 'orange' },
    { label: 'Demo content blocks', value: total, detail: `${published} enabled · ${draft} hidden`, icon: FileText, tone: 'blue' },
    { label: 'Sportswear categories', value: sportswear, detail: 'Demo records', icon: Shirt, tone: 'green' },
    { label: 'Activewear categories', value: activewear, detail: 'Demo records', icon: Shirt, tone: 'purple' },
    { label: 'Media assets', value: 3, detail: 'Static project files', icon: Image, tone: 'pink' },
    { label: 'Verified testimonials', value: publishedTestimonials, detail: 'Unverified reviews stay hidden', icon: FileText, tone: 'navy' },
  ]

  return <>
    <section className="admin-welcome">
      <div>
        <p className="admin-eyebrow">CONTENT STUDIO</p>
        <h1>Welcome back 👋</h1>
        <p>Manage your homepage, categories and media for ZED MEGA from one place.</p>
        <div className="admin-welcome-actions"><Link to="/admin/homepage" className="admin-button admin-button-primary">Edit homepage <ArrowRight size={15} /></Link><a href="/" target="_blank" rel="noreferrer" className="admin-button admin-welcome-ghost">Preview site</a></div>
      </div>
      <img src="/images/logo-shield.webp" alt="" className="admin-welcome-logo" />
    </section>
    <AdminNotifications />
    <p className="admin-demo-caption">Figures come from starter demo content in this browser, not live website statistics.</p>
    <div className="admin-stats-grid">{stats.map(({ label, value, detail, icon: Icon, tone }) => <article className={`admin-stat-card tone-${tone}`} key={label}><div className="admin-stat-top"><span>{label}</span><span className="admin-stat-icon"><Icon size={18} /></span></div><strong>{value}</strong><small>{detail}</small></article>)}</div>
    <section className="admin-panel admin-section-overview">
      <div className="admin-panel-heading"><div><h2>Homepage content</h2><p>Choose a section to edit its local draft.</p></div><Link to="/admin/homepage" className="admin-text-link">Open editor <ArrowRight size={15} /></Link></div>
      <div className="admin-section-list">{HOMEPAGE_SECTION_KEYS.map((key) => {
        const value = content[key]
        const count = Array.isArray(value) ? value.length : 1
        return <Link to="/admin/homepage" className="admin-section-row" key={key}><span className="admin-section-indicator" /><strong>{SECTION_LABELS[key]}</strong><span>{count} {count === 1 ? 'item' : 'items'}</span><ArrowRight size={15} /></Link>
      })}</div>
    </section>
    <div className="admin-quick-actions"><Link to="/admin/homepage"><span className="admin-quick-icon"><Layers3 size={20} /></span><span><strong>Edit homepage</strong><small>Change hero, steps, specs and more</small></span><ArrowRight size={16} /></Link><Link to="/admin/media"><span className="admin-quick-icon"><Image size={20} /></span><span><strong>Manage images</strong><small>Browse static assets and temporary previews</small></span><ArrowRight size={16} /></Link></div>
  </>
}
