import { useState } from 'react'
import { Loader2, RotateCcw, Upload } from 'lucide-react'
import { refreshCategoryCovers, useCategoryCovers } from '../lib/categoryCovers'
import { activewear, sports } from '../lib/categories'
import { authRequest, toWebp } from './upload'

const liveCategories = new Set([...sports, ...activewear])

// Uploads a category's cover photo straight to the server; the public site picks it up within a minute.
export function CategoryCoverUpload({ name, fallback, onError }: { name: string; fallback: string; onError: (message: string) => void }) {
  const covers = useCategoryCovers()
  const [busy, setBusy] = useState(false)
  const uploaded = covers[name]
  const shown = uploaded ?? fallback

  if (!liveCategories.has(name)) {
    return <span className="admin-cover-note">Save a website category name to upload a cover</span>
  }

  const upload = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      const response = await authRequest('POST', '/api/category-covers', { category: name, image: await toWebp(file) })
      if (!response.ok) throw new Error(((await response.json().catch(() => ({}))) as { error?: string }).error || 'Upload failed.')
      await refreshCategoryCovers()
    } catch (error) {
      onError(`${name}: ${error instanceof Error ? error.message : 'Upload failed.'}`)
    } finally {
      setBusy(false)
    }
  }

  const reset = async () => {
    if (!window.confirm(`Go back to the built-in cover for ${name}?`)) return
    setBusy(true)
    const response = await authRequest('DELETE', `/api/category-covers?category=${encodeURIComponent(name)}`)
    if (!response.ok) onError('Could not reset the cover. Please sign in again.')
    await refreshCategoryCovers()
    setBusy(false)
  }

  return (
    <div className="admin-cover-upload">
      <span className="admin-cover-thumb" style={shown ? { backgroundImage: `url(${shown})` } : undefined} />
      <label className={`admin-button admin-button-secondary admin-cover-button ${busy ? 'is-busy' : ''}`}>
        {busy ? <Loader2 size={14} className="admin-spin" /> : <Upload size={14} />} {uploaded ? 'Replace' : 'Upload'}
        <input type="file" hidden accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { upload(event.target.files?.[0]); event.target.value = '' }} />
      </label>
      {uploaded && !busy && <button type="button" className="admin-cover-reset" onClick={reset} aria-label={`Use the built-in cover for ${name}`} title="Use built-in cover"><RotateCcw size={14} /></button>}
    </div>
  )
}
