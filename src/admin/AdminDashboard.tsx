import { ArrowRight, FileText, Image, Layers3, Shirt } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdminPageHeader, useAdmin } from './AdminLayout'
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
    { label: 'Homepage sections', value: sections, detail: 'Available to edit', icon: Layers3 },
    { label: 'Demo content blocks', value: total, detail: `${published} enabled · ${draft} hidden`, icon: FileText },
    { label: 'Sportswear categories', value: sportswear, detail: 'Demo records', icon: Shirt },
    { label: 'Activewear categories', value: activewear, detail: 'Demo records', icon: Shirt },
    { label: 'Media assets', value: 3, detail: 'Static project files', icon: Image },
    { label: 'Verified testimonials', value: publishedTestimonials, detail: 'Unverified reviews stay hidden', icon: FileText },
  ]

  return <>
    <AdminPageHeader eyebrow="LOCAL CONTENT STUDIO" title="Overview" description="A snapshot of the demo content available in this browser." />
    <div className="admin-demo-caption">All figures below are derived from starter demo content. They are not live website statistics.</div>
    <div className="admin-stats-grid">{stats.map(({ label, value, detail, icon: Icon }) => <article className="admin-stat-card" key={label}><div className="admin-stat-top"><span>{label}</span><Icon size={18} /></div><strong>{value}</strong><small>{detail}</small></article>)}</div>
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
