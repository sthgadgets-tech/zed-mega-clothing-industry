import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ImagePlus, Loader2, UploadCloud, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { AdminPageHeader } from './AdminLayout'
import { authRequest, toWebp } from './upload'
import { ProductEditCard, type AdminProduct } from './ProductEditCard'
import { activewear, sports } from '../lib/categories'

type Message = { type: 'ok' | 'error'; text: string }

export function AdminProducts() {
  const [searchParams] = useSearchParams()
  // Categories page links here with ?category=<name>.
  const [category, setCategory] = useState(() => [...sports, ...activewear].find((item) => item === searchParams.get('category')) ?? sports[0])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState<File[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [fileKey, setFileKey] = useState(0)
  const [dragging, setDragging] = useState(false)
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files])

  useEffect(() => () => previews.forEach(({ url }) => URL.revokeObjectURL(url)), [previews])

  // Adds to the current pick instead of replacing it, so photos can be dropped in batches.
  const addFiles = (list: FileList | null) => {
    const picked = Array.from(list ?? []).filter((file) => /^image\/(jpeg|png|webp)$/.test(file.type))
    if (picked.length) setFiles((current) => [...current, ...picked])
    setMessage(null)
  }

  const load = async () => {
    setLoading(true)
    try {
      // all=1 with the admin token also returns built-in designs that were hidden.
      const response = await authRequest('GET', `/api/products?category=${encodeURIComponent(category)}&all=1`)
      const data = (await response.json()) as { products?: AdminProduct[] }
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

  const hiddenCount = products.filter((item) => item.hidden).length
  const visibleCount = products.length - hiddenCount

  return <>
    <AdminPageHeader eyebrow="PRODUCT CATALOGUE" title="Products &amp; photos" description="Every design on the website, by category. Upload new ones, or edit, replace the photo of, hide or delete existing ones. Changes show on the site within about a minute." />

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
        <div className="admin-field admin-field-wide">Photos
          <label
            className={`admin-upload-drop ${dragging ? 'is-dragging' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files) }}
          >
            <UploadCloud size={28} />
            <strong>Drag photos here or tap to choose</strong>
            <span>JPG, PNG or WebP · several at once · big phone photos are resized automatically</span>
            <input key={fileKey} type="file" hidden accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => addFiles(event.target.files)} />
          </label>
        </div>
      </div>
      {previews.length > 0 && (
        <div className="admin-upload-previews">
          {previews.map(({ file, url }, index) => (
            <figure key={url}>
              <img src={url} alt={file.name} />
              <button type="button" onClick={() => setFiles((current) => current.filter((_, i) => i !== index))} aria-label={`Remove ${file.name}`}><X size={14} /></button>
            </figure>
          ))}
        </div>
      )}
      {files.length > 0 && <p className="admin-field-help">{files.length} photo{files.length > 1 ? 's' : ''} ready to upload to {category}.</p>}
      {message && <p className={`admin-product-msg is-${message.type}`}>{message.text}</p>}
      <button type="submit" className="admin-button admin-button-primary admin-product-submit" disabled={busy}>
        {busy ? <><Loader2 size={16} className="admin-spin" /> Uploading…</> : <><ImagePlus size={16} /> Upload to {category}</>}
      </button>
    </form>

    <section className="admin-panel">
      <h2 className="admin-product-heading">{category}: {loading ? '…' : `${visibleCount} on the website${hiddenCount ? ` · ${hiddenCount} hidden` : ''}`}</h2>
      {!loading && products.length === 0 && <p className="admin-empty">No designs in this category yet. Upload the first one above.</p>}
      <div className="admin-edit-grid">
        {products.map((product) => <ProductEditCard key={`${product.id}-${product.image}-${product.title}-${product.hidden}`} product={product} onChanged={load} onError={(text) => setMessage({ type: 'error', text })} />)}
      </div>
    </section>
  </>
}
