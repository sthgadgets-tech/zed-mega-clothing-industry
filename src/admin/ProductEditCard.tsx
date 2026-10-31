import { useState } from 'react'
import { Eye, EyeOff, ImageUp, Loader2, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { activewear, sports } from '../lib/categories'
import { authRequest, toWebp } from './upload'

export type AdminProduct = {
  id: string
  category: string
  title: string
  description: string
  image: string
  source: 'builtin' | 'upload'
  edited?: boolean
  hidden?: boolean
}

async function send(method: string, url: string, body?: unknown) {
  const response = await authRequest(method, url, body)
  if (!response.ok) throw new Error(((await response.json().catch(() => ({}))) as { error?: string }).error || 'Something went wrong. Please sign in again.')
}

// One catalogue design in the admin grid: edit text, replace the photo, move category, hide/delete or restore.
export function ProductEditCard({ product, onChanged, onError }: { product: AdminProduct; onChanged: () => void; onError: (message: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [title, setTitle] = useState(product.title)
  const [description, setDescription] = useState(product.description)
  const [category, setCategory] = useState(product.category)
  const [photo, setPhoto] = useState<File | null>(null)
  const preview = photo ? URL.createObjectURL(photo) : product.image
  const builtin = product.source === 'builtin'

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    try {
      await action()
      setEditing(false)
      setPhoto(null)
      onChanged()
    } catch (error) {
      onError(`${product.title}: ${error instanceof Error ? error.message : 'Something went wrong.'}`)
    } finally {
      setBusy(false)
    }
  }

  const save = () => run(async () => {
    await send('PATCH', `/api/products?id=${encodeURIComponent(product.id)}`, {
      title,
      description,
      category,
      ...(photo ? { image: await toWebp(photo) } : {}),
    })
  })

  const remove = () => {
    const question = builtin
      ? `Hide "${product.title}" from the website? You can restore it later.`
      : `Delete "${product.title}" permanently?`
    if (window.confirm(question)) run(() => send('DELETE', `/api/products?id=${encodeURIComponent(product.id)}`))
  }

  const restore = () => {
    if (window.confirm(`Undo every change to "${product.title}" and show the original design again?`)) {
      run(() => send('POST', `/api/products?action=restore&id=${encodeURIComponent(product.id)}`))
    }
  }

  return (
    <article className={`admin-edit-card ${product.hidden ? 'is-hidden' : ''}`}>
      <div className="admin-edit-media">
        <img src={preview} alt={product.title} loading="lazy" />
        <span className={`admin-edit-badge ${builtin ? '' : 'is-upload'}`}>{product.hidden ? 'Hidden' : builtin ? (product.edited ? 'Edited' : 'Website') : 'Uploaded'}</span>
        {editing && (
          <label className="admin-edit-photo">
            <ImageUp size={15} /> Replace photo
            <input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
          </label>
        )}
      </div>

      {editing ? (
        <div className="admin-edit-form">
          <label>Title<input value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} /></label>
          <label>Description<textarea rows={3} value={description} maxLength={300} onChange={(event) => setDescription(event.target.value)} /></label>
          <label>Category
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <optgroup label="Sportswear">{sports.map((item) => <option key={item}>{item}</option>)}</optgroup>
              <optgroup label="Activewear">{activewear.map((item) => <option key={item}>{item}</option>)}</optgroup>
            </select>
          </label>
          <div className="admin-edit-actions">
            <button type="button" className="admin-button admin-button-primary" disabled={busy || !title.trim()} onClick={save}>{busy ? <Loader2 size={14} className="admin-spin" /> : null} Save</button>
            <button type="button" className="admin-button admin-button-secondary" disabled={busy} onClick={() => { setEditing(false); setPhoto(null); setTitle(product.title); setDescription(product.description); setCategory(product.category) }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="admin-edit-body">
          <h3>{product.title}</h3>
          <p>{product.description}</p>
          <div className="admin-edit-actions">
            {product.hidden
              ? <button type="button" className="admin-button admin-button-secondary" disabled={busy} onClick={restore}><Eye size={14} /> Show again</button>
              : <>
                  <button type="button" className="admin-button admin-button-secondary" disabled={busy} onClick={() => setEditing(true)}><Pencil size={14} /> Edit</button>
                  <button type="button" className="admin-icon-action is-danger" disabled={busy} onClick={remove} aria-label={builtin ? `Hide ${product.title}` : `Delete ${product.title}`} title={builtin ? 'Hide from website' : 'Delete'}>{builtin ? <EyeOff size={15} /> : <Trash2 size={15} />}</button>
                </>}
            {builtin && product.edited && !product.hidden && <button type="button" className="admin-icon-action" disabled={busy} onClick={restore} aria-label={`Restore original ${product.title}`} title="Restore original"><RotateCcw size={15} /></button>}
          </div>
        </div>
      )}
    </article>
  )
}
