import { useEffect, useState, type FormEvent } from 'react'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { AdminPageHeader } from './AdminLayout'
import { getToken } from './auth'
import { activewear, sports } from '../lib/categories'

type Product = { id: string; category: string; title: string; description: string; image: string }
type Message = { type: 'ok' | 'error'; text: string }

const MAX_SIDE = 1400

// Shrinks big camera photos to a web-sized WebP before upload.
async function toWebp(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/webp', 0.82)
}

function authRequest(method: string, url: string, body?: unknown) {
  return fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken() ?? ''}` },
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function AdminProducts() {
  const [category, setCategory] = useState(sports[0])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState<File[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [fileKey, setFileKey] = useState(0)

  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products?category=${encodeURIComponent(category)}`, { cache: 'no-store' })
      const data = (await response.json()) as { products?: Product[] }
      setProducts(data.products ?? [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [category])

  const upload = async (event: FormEvent) => {
    event.preventDefault()
    if (!files.length) return setMessage({ type: 'error', text: 'Choose at least one photo.' })
    setBusy(true)
    setMessage(null)
    const name = title.trim() || `Custom ${category}`
    let done = 0
    for (const [index, file] of files.entries()) {
      try {
        const image = await toWebp(file)
        const response = await authRequest('POST', '/api/products', { category, title: files.length > 1 ? `${name} ${index + 1}` : name, description, image })
        if (!response.ok) throw new Error(((await response.json().catch(() => ({}))) as { error?: string }).error || 'Upload failed.')
        done += 1
      } catch (error) {
        setMessage({ type: 'error', text: `${file.name}: ${error instanceof Error ? error.message : 'Upload failed.'}` })
        break
      }
    }
    setBusy(false)
    if (done === files.length) {
      setMessage({ type: 'ok', text: `${done} photo${done > 1 ? 's' : ''} added to ${category}.` })
      setFiles([])
      setFileKey((key) => key + 1)
      setTitle('')
      setDescription('')
    }
    load()
  }

  const remove = async (product: Product) => {
    if (!window.confirm(`Delete "${product.title}" from ${product.category}?`)) return
    const response = await authRequest('DELETE', `/api/products?id=${product.id}`)
    if (!response.ok) return setMessage({ type: 'error', text: 'Could not delete. Please sign in again.' })
    setProducts((current) => current.filter((item) => item.id !== product.id))
  }

  return <>
    <AdminPageHeader eyebrow="PRODUCT CATALOGUE" title="Product photos" description="Upload photos to any category. They appear on that category page within about a minute." />

    <form className="admin-panel" onSubmit={upload}>
      <div className="admin-field-grid">
        <label className="admin-field">Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <optgroup label="Sportswear">{sports.map((item) => <option key={item}>{item}</option>)}</optgroup>
            <optgroup label="Activewear">{activewear.map((item) => <option key={item}>{item}</option>)}</optgroup>
          </select>
        </label>
        <label className="admin-field">Product title
          <input value={title} maxLength={120} placeholder={`Custom ${category}`} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="admin-field admin-field-wide">Short description (optional)
          <textarea rows={2} value={description} maxLength={300} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <label className="admin-field admin-field-wide">Photos
          <input key={fileKey} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
        </label>
      </div>
      {files.length > 0 && <p className="admin-field-help">{files.length} photo{files.length > 1 ? 's' : ''} selected. Large photos are resized automatically.</p>}
      {message && <p className={`admin-product-msg is-${message.type}`}>{message.text}</p>}
      <button type="submit" className="admin-button admin-button-primary admin-product-submit" disabled={busy}>
        {busy ? <><Loader2 size={16} className="admin-spin" /> Uploading…</> : <><ImagePlus size={16} /> Upload to {category}</>}
      </button>
    </form>

    <section className="admin-panel">
      <h2 className="admin-product-heading">{category}: {loading ? '…' : `${products.length} uploaded`}</h2>
      {!loading && products.length === 0 && <p className="admin-empty">No uploaded photos yet. The category still shows its built-in designs.</p>}
      <div className="admin-product-grid">
        {products.map((product) => (
          <figure key={product.id} className="admin-product-card">
            <img src={product.image} alt={product.title} loading="lazy" />
            <figcaption><span>{product.title}</span><button type="button" onClick={() => remove(product)} aria-label={`Delete ${product.title}`}><Trash2 size={14} /></button></figcaption>
          </figure>
        ))}
      </div>
    </section>
  </>
}
