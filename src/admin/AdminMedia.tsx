import { useState } from 'react'
import { FileImage, Search, Trash2, UploadCloud } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdminPageHeader, AdminSaveBar, useAdmin } from './AdminLayout'
import { cloneInitialMedia } from './mockContent'
import type { MediaAsset } from './types'

// Uploads that reach the website live in Product photos (/admin/products); this page only lists bundled images.
export function AdminMedia() {
  const { content } = useAdmin()
  const [assets, setAssets] = useState<MediaAsset[]>(cloneInitialMedia)
  const [query, setQuery] = useState('')
  const error = ''
  const visible = assets.filter((asset) => asset.name.toLowerCase().includes(query.toLowerCase()))
  const update = (id: string, changes: Partial<MediaAsset>) => setAssets((current) => current.map((asset) => asset.id === id ? { ...asset, ...changes } : asset))
  const remove = (asset: MediaAsset) => { if (asset.usedBy.length && !window.confirm('This image is in use. Remove the temporary preview anyway?')) return; setAssets((current) => current.filter((item) => item.id !== asset.id)) }
  const formatSize = (bytes: number | null) => bytes === null ? 'Project asset' : `${(bytes / 1024).toFixed(0)} KB`
  const formatSaving = (asset: MediaAsset) => asset.originalSizeBytes && asset.sizeBytes ? ` (was ${formatSize(asset.originalSizeBytes)}, −${Math.round(100 - asset.sizeBytes / asset.originalSizeBytes * 100)}%)` : ''

  return <>
    <AdminPageHeader eyebrow="ASSET MANAGEMENT" title="Media library" description="Images that ship with the website. To add new photos to a category, use Product photos." />
    <div className="admin-dropzone admin-media-redirect"><UploadCloud size={26} /><strong>Want a photo on the website?</strong><span>Upload it from Product photos. Photos there are saved to the database and show on the chosen category page.</span><Link to="/admin/products" className="admin-button admin-button-primary">Upload product photos</Link></div>
    {error && <p className="admin-error-banner" role="alert">{error}</p>}
    <div className="admin-toolbar"><div className="admin-search"><Search size={16} /><input placeholder="Search media" value={query} onChange={(event) => setQuery(event.target.value)} /></div><span className="admin-demo-caption">{visible.length} assets · session previews are not persistent</span></div>
    <div className="admin-media-grid">{visible.map((asset) => <article className="admin-media-card" key={asset.id}><div className="admin-media-preview"><img src={asset.src} alt={asset.altText} /></div><div className="admin-media-info"><strong>{asset.name}</strong><small>{asset.width && asset.height ? `${asset.width} × ${asset.height}` : 'Dimensions unavailable'} · {formatSize(asset.sizeBytes)}{formatSaving(asset)}</small>{asset.isSession && <a className="admin-field-help" href={asset.src} download={asset.name}>Download {asset.originalSizeBytes ? 'compressed' : ''} file</a>}<small>{asset.usedBy.length ? `Used by: ${asset.usedBy.join(', ')}` : 'Not assigned to a section'}</small><label className="admin-field"><span>Alt text</span><input value={asset.altText} onChange={(event) => update(asset.id, { altText: event.target.value })} /></label><label className="admin-field"><span>Description</span><textarea rows={2} value={asset.description} onChange={(event) => update(asset.id, { description: event.target.value })} /></label><div className="admin-media-actions"><span className={asset.isSession ? 'admin-session-badge' : 'admin-static-badge'}>{asset.isSession ? 'Temporary preview' : 'Static project file'}</span><button type="button" className="admin-icon-button is-danger" onClick={() => remove(asset)} aria-label={`Delete ${asset.name}`}><Trash2 size={15} /></button></div></div></article>)}</div>
    <AdminSaveBar />
    {content.categories.length > 0 && <p className="admin-field-help admin-media-footnote"><FileImage size={15} /> Media references shown here are informational; category images still use the existing public assets in `App.tsx`.</p>}
  </>
}
