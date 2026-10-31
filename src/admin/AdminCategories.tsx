import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink, Search } from 'lucide-react'
import { AdminPageHeader } from './AdminLayout'
import { CategoryCoverUpload } from './CategoryCoverUpload'
import { authRequest } from './upload'
import { activewear, sports } from '../lib/categories'
import { cloneInitialContent } from './mockContent'

const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
// Built-in covers that ship with the site; an uploaded cover replaces them.
const builtinCovers = Object.fromEntries(cloneInitialContent().categories.map((category) => [category.name, category.imagePath]))

type Group = 'all' | 'sportswear' | 'activewear'

// The website's real categories: cover photo upload, live design count, and a shortcut to edit their designs.
export function AdminCategories() {
  const [group, setGroup] = useState<Group>('all')
  const [query, setQuery] = useState('')
  const [counts, setCounts] = useState<Record<string, number> | null>(null)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    authRequest('GET', '/api/products?all=1')
      .then((response) => (response.ok ? response.json() : { products: [] }))
      .then((data: { products?: { category: string; hidden?: boolean }[] }) => {
        const next: Record<string, number> = {}
        for (const product of data.products ?? []) if (!product.hidden) next[product.category] = (next[product.category] ?? 0) + 1
        setCounts(next)
      })
      .catch(() => setCounts({}))
  }, [])

  const rows = [
    ...sports.map((name) => ({ name, group: 'sportswear' as const })),
    ...activewear.map((name) => ({ name, group: 'activewear' as const })),
  ].filter((row) => (group === 'all' || row.group === group) && row.name.toLowerCase().includes(query.toLowerCase()))

  return <>
    <AdminPageHeader eyebrow="PRODUCT CATALOGUE" title="Categories" description="The categories on the website. Upload a cover photo, see how many designs each one shows, and jump to its designs to edit them." />
    <div className="admin-toolbar">
      <div className="admin-search"><Search size={16} /><input placeholder="Search categories" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <div className="admin-tabs">
        {(['all', 'sportswear', 'activewear'] as const).map((value) => <button key={value} className={group === value ? 'is-active' : ''} onClick={() => setGroup(value)}>{value === 'all' ? 'All' : value === 'sportswear' ? 'Sportswear' : 'Activewear'}</button>)}
      </div>
    </div>
    {uploadError && <p className="admin-product-msg is-error" role="alert">{uploadError}</p>}
    <section className="admin-panel admin-cat-panel">
      <div className="admin-cat-head"><span>Category</span><span>Cover photo</span><span>Designs</span><span /></div>
      {rows.map(({ name, group: rowGroup }) => (
        <article className="admin-cat-row" key={name}>
          <div className="admin-cat-name"><strong>{name}</strong><small>{rowGroup === 'sportswear' ? 'Sportswear' : 'Activewear'}</small></div>
          <CategoryCoverUpload name={name} fallback={builtinCovers[name] ?? ''} onError={setUploadError} />
          <span className="admin-cat-count">{counts ? `${counts[name] ?? 0} on website` : '…'}</span>
          <div className="admin-cat-links">
            <Link to={`/admin/products?category=${encodeURIComponent(name)}`} className="admin-button admin-button-secondary">Manage designs <ArrowRight size={14} /></Link>
            <a href={`/category/${slugify(name)}`} target="_blank" rel="noreferrer" className="admin-icon-action" aria-label={`Open ${name} on the website`} title="Open on website"><ExternalLink size={15} /></a>
          </div>
        </article>
      ))}
      {rows.length === 0 && <p className="admin-empty">No categories match your search.</p>}
    </section>
  </>
}
