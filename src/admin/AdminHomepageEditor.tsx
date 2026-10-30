import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronUp, Eye, EyeOff, Plus, ShieldAlert, Trash2 } from 'lucide-react'
import { AdminPageHeader, AdminSaveBar, useAdmin } from './AdminLayout'
import type { Entry, SiteContent, Testimonial } from './types'

const entryGroups: { key: 'audience' | 'ordering' | 'specifications' | 'manufacturing' | 'shipping'; label: string }[] = [
  { key: 'audience', label: 'Who we make for' },
  { key: 'ordering', label: 'How ordering works' },
  { key: 'specifications', label: 'Customization specifications' },
  { key: 'manufacturing', label: 'Manufacturing process' },
  { key: 'shipping', label: 'Worldwide shipping' },
]

export function EntryEditor({ label, entries, onChange, showBodyLabel = 'Description' }: { label: string; entries: Entry[]; onChange: (entries: Entry[]) => void; showBodyLabel?: string }) {
  const update = (index: number, changes: Partial<Entry>) => onChange(entries.map((entry, i) => i === index ? { ...entry, ...changes } : entry))
  const move = (index: number, delta: number) => {
    const next = [...entries]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }
  const add = () => onChange([...entries, { id: `${label}-${Date.now()}`, heading: 'New item', body: '', enabled: true }])

  return <section className="admin-panel admin-editor-group">
    <div className="admin-panel-heading"><div><h2>{label}</h2><p>{entries.length} demo {entries.length === 1 ? 'item' : 'items'}</p></div><button type="button" className="admin-button admin-button-secondary" onClick={add}><Plus size={15} /> Add item</button></div>
    <div className="admin-entry-list">{entries.map((entry, index) => <article className={`admin-entry-card ${entry.enabled ? '' : 'is-disabled'}`} key={entry.id}>
      <div className="admin-entry-tools"><span className="admin-entry-index">{String(index + 1).padStart(2, '0')}</span><div className="admin-entry-tool-buttons"><button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up"><ChevronUp size={16} /></button><button type="button" onClick={() => move(index, 1)} disabled={index === entries.length - 1} aria-label="Move down"><ChevronDown size={16} /></button><button type="button" onClick={() => update(index, { enabled: !entry.enabled })} aria-label={entry.enabled ? 'Hide item' : 'Show item'}>{entry.enabled ? <Eye size={16} /> : <EyeOff size={16} />}</button><button type="button" className="is-danger" onClick={() => onChange(entries.filter((_, i) => i !== index))} aria-label="Delete item"><Trash2 size={16} /></button></div></div>
      <label className="admin-field"><span>Heading</span><input value={entry.heading} onChange={(event) => update(index, { heading: event.target.value })} /></label>
      <label className="admin-field"><span>{showBodyLabel}</span><textarea rows={2} value={entry.body} onChange={(event) => update(index, { body: event.target.value })} /></label>
    </article>)}</div>
  </section>
}

export function AdminHomepageEditor() {
  const { content, updateContent, save } = useAdmin()
  const [publishMessage, setPublishMessage] = useState('')
  const updateEntries = (key: keyof SiteContent, entries: Entry[]) => updateContent({ ...content, [key]: entries } as SiteContent)
  const updateTestimonial = (index: number, changes: Partial<Testimonial>) => {
    const testimonials = content.testimonials.map((item, i) => i === index ? { ...item, ...changes } : item)
    // An unverified review can never be enabled for display, even in this prototype.
    if (!testimonials[index].verified) testimonials[index].enabled = false
    updateContent({ ...content, testimonials })
  }

  const publishPreview = () => {
    if (!window.confirm('This demo cannot publish to the public website. Save a local preview draft instead?')) return
    const ok = save()
    setPublishMessage(ok ? 'Local preview saved. The public website was not changed.' : 'Draft could not be saved in this browser.')
  }

  return <>
    <AdminPageHeader eyebrow="CONTENT EDITOR" title="Homepage" description="Edit section content, visibility, and order. Changes remain local until a real CMS backend is connected.">
      <button type="button" className="admin-button admin-button-secondary" onClick={publishPreview}><CheckCircle2 size={16} /> Publish preview</button>
    </AdminPageHeader>
    {publishMessage && <div className="admin-inline-notice" role="status">{publishMessage}</div>}
    <section className="admin-panel admin-hero-editor">
      <div className="admin-panel-heading"><div><h2>Hero section</h2><p>Primary content at the top of the homepage.</p></div></div>
      <div className="admin-field-grid">
        <label className="admin-field admin-field-wide"><span>Main heading</span><textarea rows={2} value={content.hero.heading} onChange={(event) => updateContent({ ...content, hero: { ...content.hero, heading: event.target.value } })} /></label>
        <label className="admin-field admin-field-wide"><span>Supporting paragraph</span><textarea rows={3} value={content.hero.body} onChange={(event) => updateContent({ ...content, hero: { ...content.hero, body: event.target.value } })} /></label>
        <label className="admin-field"><span>Primary button text</span><input value={content.hero.primaryText} onChange={(event) => updateContent({ ...content, hero: { ...content.hero, primaryText: event.target.value } })} /></label>
        <label className="admin-field"><span>Primary button link</span><input value={content.hero.primaryLink} onChange={(event) => updateContent({ ...content, hero: { ...content.hero, primaryLink: event.target.value } })} /></label>
        <label className="admin-field"><span>Secondary button text</span><input value={content.hero.secondaryText} onChange={(event) => updateContent({ ...content, hero: { ...content.hero, secondaryText: event.target.value } })} /></label>
        <label className="admin-field"><span>Secondary button link</span><input value={content.hero.secondaryLink} onChange={(event) => updateContent({ ...content, hero: { ...content.hero, secondaryLink: event.target.value } })} /></label>
        <label className="admin-field admin-field-wide"><span>Image overlay strength: {content.hero.overlayStrength}%</span><input type="range" min="0" max="100" value={content.hero.overlayStrength} onChange={(event) => updateContent({ ...content, hero: { ...content.hero, overlayStrength: Number(event.target.value) } })} /></label>
      </div>
      <p className="admin-field-help"><ShieldAlert size={15} /> Desktop and mobile hero image controls require persistent media storage and are not available in this local prototype.</p>
    </section>
    {entryGroups.map(({ key, label }) => <EntryEditor key={key} label={label} entries={content[key]} onChange={(entries) => updateEntries(key, entries)} />)}
    <section className="admin-panel admin-editor-group">
      <div className="admin-panel-heading"><div><h2>Testimonials</h2><p>Unverified reviews are kept hidden.</p></div></div>
      {content.testimonials.map((review, index) => <div className="admin-review-card" key={review.id}>
        <label className="admin-field"><span>Review text</span><textarea rows={3} value={review.quote} onChange={(event) => updateTestimonial(index, { quote: event.target.value })} /></label>
        <div className="admin-field-grid">
          <label className="admin-field"><span>Author</span><input value={review.author} onChange={(event) => updateTestimonial(index, { author: event.target.value })} /></label>
          <label className="admin-check"><input type="checkbox" checked={review.verified} onChange={(event) => updateTestimonial(index, { verified: event.target.checked, enabled: event.target.checked && review.enabled })} /><span>Verified with written customer permission</span></label>
        </div>
        <label className="admin-check"><input type="checkbox" checked={review.enabled && review.verified} disabled={!review.verified} onChange={(event) => updateTestimonial(index, { enabled: event.target.checked })} /><span>Visible on public site (preview only)</span></label>
        {!review.verified && <p className="admin-field-help"><ShieldAlert size={15} /> This demo review is unverified and will not be shown.</p>}
      </div>)}
    </section>
    <AdminSaveBar />
  </>
}
