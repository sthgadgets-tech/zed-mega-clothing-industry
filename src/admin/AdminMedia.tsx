import { useEffect, useRef, useState } from 'react'
import { FileImage, Search, Trash2, UploadCloud } from 'lucide-react'
import { AdminPageHeader, AdminSaveBar, useAdmin } from './AdminLayout'
import { cloneInitialMedia } from './mockContent'
import type { MediaAsset } from './types'

const MAX_BYTES = 20 * 1024 * 1024
const ACCEPTED = new Set(['image/jpeg', 'image/png', 'image/webp'])
// Largest edge kept after compression; product photos never display wider than this.
const MAX_EDGE = 2000
// WebP at 0.85 is visually indistinguishable from the source for photos.
const QUALITY = 0.85

// Re-encodes an image as WebP in the browser. Returns the original file when
// compression would not make it smaller.
async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', QUALITY))
  if (!blob || blob.size >= file.size) return file
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' })
}

export function AdminMedia() {
  const { content } = useAdmin()
  const [assets, setAssets] = useState<MediaAsset[]>(cloneInitialMedia)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const urls = useRef<string[]>([])
  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), [])

  const [compress, setCompress] = useState(true)

  const addFiles = (files: FileList | File[]) => {
    setError('')
    Array.from(files).forEach(async (original) => {
      if (!ACCEPTED.has(original.type)) { setError('Use JPG, PNG, or WebP images only.'); return }
      if (original.size > MAX_BYTES) { setError('Each image must be 20 MB or smaller.'); return }
      const file = compress ? await compressImage(original).catch(() => original) : original
      const src = URL.createObjectURL(file)
      urls.current.push(src)
      const image = new Image()
      image.onload = () => setAssets((current) => [...current, { id: `session-${Date.now()}-${file.name}`, name: file.name, src, altText: file.name.replace(/\.[^.]+$/, ''), description: '', width: image.naturalWidth, height: image.naturalHeight, sizeBytes: file.size, originalSizeBytes: file === original ? undefined : original.size, usedBy: [], isSession: true }])
      image.src = src
    })
  }
  const visible = assets.filter((asset) => asset.name.toLowerCase().includes(query.toLowerCase()))
  const update = (id: string, changes: Partial<MediaAsset>) => setAssets((current) => current.map((asset) => asset.id === id ? { ...asset, ...changes } : asset))
  const remove = (asset: MediaAsset) => { if (asset.usedBy.length && !window.confirm('This image is in use. Remove the temporary preview anyway?')) return; setAssets((current) => current.filter((item) => item.id !== asset.id)) }
  const formatSize = (bytes: number | null) => bytes === null ? 'Project asset' : `${(bytes / 1024).toFixed(0)} KB`
  const formatSaving = (asset: MediaAsset) => asset.originalSizeBytes && asset.sizeBytes ? ` (was ${formatSize(asset.originalSizeBytes)}, −${Math.round(100 - asset.sizeBytes / asset.originalSizeBytes * 100)}%)` : ''

  return <>
    <AdminPageHeader eyebrow="ASSET MANAGEMENT" title="Media library" description="Review existing project images and preview local uploads. Local uploads are temporary and never reach Vercel or the public site." />
    <div className={`admin-dropzone ${dragging ? 'is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files) }}><UploadCloud size={26} /><strong>Drop images here</strong><span>or choose JPG, PNG, or WebP up to 20 MB</span><label className="admin-compress-toggle"><input type="checkbox" checked={compress} onChange={(event) => setCompress(event.target.checked)} /> Compress images (WebP, no visible quality loss)</label><label className="admin-button admin-button-secondary">Choose files<input type="file" hidden accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => event.target.files && addFiles(event.target.files)} /></label></div>
    {error && <p className="admin-error-banner" role="alert">{error}</p>}
    <div className="admin-toolbar"><div className="admin-search"><Search size={16} /><input placeholder="Search media" value={query} onChange={(event) => setQuery(event.target.value)} /></div><span className="admin-demo-caption">{visible.length} assets · session previews are not persistent</span></div>
    <div className="admin-media-grid">{visible.map((asset) => <article className="admin-media-card" key={asset.id}><div className="admin-media-preview"><img src={asset.src} alt={asset.altText} /></div><div className="admin-media-info"><strong>{asset.name}</strong><small>{asset.width && asset.height ? `${asset.width} × ${asset.height}` : 'Dimensions unavailable'} · {formatSize(asset.sizeBytes)}{formatSaving(asset)}</small>{asset.isSession && <a className="admin-field-help" href={asset.src} download={asset.name}>Download {asset.originalSizeBytes ? 'compressed' : ''} file</a>}<small>{asset.usedBy.length ? `Used by: ${asset.usedBy.join(', ')}` : 'Not assigned to a section'}</small><label className="admin-field"><span>Alt text</span><input value={asset.altText} onChange={(event) => update(asset.id, { altText: event.target.value })} /></label><label className="admin-field"><span>Description</span><textarea rows={2} value={asset.description} onChange={(event) => update(asset.id, { description: event.target.value })} /></label><div className="admin-media-actions"><span className={asset.isSession ? 'admin-session-badge' : 'admin-static-badge'}>{asset.isSession ? 'Temporary preview' : 'Static project file'}</span><button type="button" className="admin-icon-button is-danger" onClick={() => remove(asset)} aria-label={`Delete ${asset.name}`}><Trash2 size={15} /></button></div></div></article>)}</div>
    <AdminSaveBar />
    {content.categories.length > 0 && <p className="admin-field-help admin-media-footnote"><FileImage size={15} /> Media references shown here are informational; category images still use the existing public assets in `App.tsx`.</p>}
  </>
}
