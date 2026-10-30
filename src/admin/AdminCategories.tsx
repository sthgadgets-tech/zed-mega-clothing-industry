import { useMemo, useState } from 'react'
import { ArrowUp, ArrowDown, Eye, EyeOff, Plus, Search, Trash2 } from 'lucide-react'
import { AdminPageHeader, AdminSaveBar, useAdmin } from './AdminLayout'
import type { Category } from './types'

export function AdminCategories() {
  const { content, updateContent } = useAdmin()
  const [group, setGroup] = useState<'all' | Category['group']>('all')
  const [query, setQuery] = useState('')
  const categories = useMemo(() => content.categories.filter((item) => (group === 'all' || item.group === group) && item.name.toLowerCase().includes(query.toLowerCase())), [content.categories, group, query])
  const update = (id: string, changes: Partial<Category>) => updateContent({ ...content, categories: content.categories.map((item) => item.id === id ? { ...item, ...changes } : item) })
  const move = (id: string, delta: number) => {
    const current = content.categories.findIndex((item) => item.id === id)
    const target = current + delta
    if (current < 0 || target < 0 || target >= content.categories.length) return
    const next = [...content.categories]
    ;[next[current], next[target]] = [next[target], next[current]]
    updateContent({ ...content, categories: next })
  }
  const add = () => updateContent({ ...content, categories: [...content.categories, { id: `category-${Date.now()}`, group: 'sportswear', name: 'New category', href: '/quote', imagePath: '', enabled: true }] })

  return <>
    <AdminPageHeader eyebrow="PRODUCT CATALOGUE" title="Categories" description="Manage the demo sportswear and activewear catalogue. Public cards are unchanged until a real CMS is connected."><button type="button" className="admin-button admin-button-secondary" onClick={add}><Plus size={16} /> Add category</button></AdminPageHeader>
    <div className="admin-toolbar"><div className="admin-search"><Search size={16} /><input placeholder="Search categories" value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="admin-tabs"><button className={group === 'all' ? 'is-active' : ''} onClick={() => setGroup('all')}>All</button><button className={group === 'sportswear' ? 'is-active' : ''} onClick={() => setGroup('sportswear')}>Sportswear</button><button className={group === 'activewear' ? 'is-active' : ''} onClick={() => setGroup('activewear')}>Activewear</button></div></div>
    <section className="admin-panel admin-table-panel"><div className="admin-table-head"><span>Category</span><span>Group</span><span>Destination</span><span>Image reference</span><span>Status</span><span>Order</span></div>{categories.map((category) => <article className={`admin-table-row ${category.enabled ? '' : 'is-disabled'}`} key={category.id}><div className="admin-category-name"><span className="admin-category-thumb" style={category.imagePath ? { backgroundImage: `url(${category.imagePath})` } : undefined}>{!category.imagePath && category.name.slice(0, 1)}</span><input value={category.name} onChange={(event) => update(category.id, { name: event.target.value })} /></div><select value={category.group} onChange={(event) => update(category.id, { group: event.target.value as Category['group'] })}><option value="sportswear">Sportswear</option><option value="activewear">Activewear</option></select><input value={category.href} onChange={(event) => update(category.id, { href: event.target.value })} /><input aria-label={`${category.name} image reference`} placeholder="/images/... or URL" value={category.imagePath} onChange={(event) => update(category.id, { imagePath: event.target.value })} /><button type="button" className={`admin-status ${category.enabled ? 'is-on' : ''}`} onClick={() => update(category.id, { enabled: !category.enabled })}>{category.enabled ? <><Eye size={14} /> Published preview</> : <><EyeOff size={14} /> Hidden</>}</button><div className="admin-row-actions"><button type="button" onClick={() => move(category.id, -1)} aria-label="Move up"><ArrowUp size={14} /></button><button type="button" onClick={() => move(category.id, 1)} aria-label="Move down"><ArrowDown size={14} /></button><button type="button" className="is-danger" onClick={() => updateContent({ ...content, categories: content.categories.filter((item) => item.id !== category.id) })} aria-label="Delete category"><Trash2 size={14} /></button></div></article>)}{categories.length === 0 && <p className="admin-empty">No categories match your search.</p>}</section>
    <AdminSaveBar />
  </>
}
