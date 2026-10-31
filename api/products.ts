// The product catalogue: built-in designs (_showcase.ts) plus admin uploads, both editable from /admin/products.
//   GET    /api/products?category=Baseball        public list for one category (or everything without it)
//   GET    /api/products?...&all=1                admin view: also returns hidden built-in designs
//   POST   /api/products                          admin: new upload { category, title, description, image: "data:image/webp;base64,..." }
//   PATCH  /api/products?id=<id>                  admin: edit { title?, description?, category?, image? }
//   DELETE /api/products?id=<id>                  admin: delete an upload, or hide a built-in design
//   POST   /api/products?action=restore&id=<id>   admin: undo every edit to a built-in design
// Uploads live in `products`; edits to built-in designs live in `product_overrides`.
// Image bytes are served by /api/product-image.

import { Binary, ObjectId } from 'mongodb'
import { getDb } from './_db.js'
import { verifyToken } from './_auth.js'
import { activewear, sports } from './_categories.js'
import { showcaseProducts } from './_showcase.js'

const categories = new Set([...sports, ...activewear])
const builtinById = new Map(showcaseProducts.map((product) => [product.id, product]))
const MAX_IMAGE_BYTES = 3 * 1024 * 1024
const imagePattern = /^data:(image\/(?:webp|jpeg|png));base64,([A-Za-z0-9+/=]+)$/
const objectIdPattern = /^[a-f0-9]{24}$/

type UploadDoc = { _id: ObjectId; category: string; title: string; description: string; contentType: string; image: Binary; createdAt: Date }
type OverrideDoc = { id: string; title?: string; description?: string; category?: string; hidden?: boolean; contentType?: string; image?: Binary; updatedAt: Date }

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function isAdmin(request: Request) {
  return verifyToken(request.headers.get('authorization')?.replace(/^Bearer\s+/i, ''))
}

function parseImage(value: unknown): { contentType: string; image: Binary } | { error: string } | null {
  if (value === undefined || value === null || value === '') return null
  const match = typeof value === 'string' ? imagePattern.exec(value) : null
  if (!match) return { error: 'Upload a WebP, JPEG or PNG image.' }
  const bytes = Buffer.from(match[2], 'base64')
  if (bytes.length > MAX_IMAGE_BYTES) return { error: 'Image is larger than 3 MB.' }
  return { contentType: match[1], image: new Binary(bytes) }
}

async function list(request: Request) {
  const params = new URL(request.url).searchParams
  const category = params.get('category')
  const includeHidden = params.get('all') === '1' && isAdmin(request)
  const db = await getDb()
  const [uploads, overrides] = await Promise.all([
    db.collection<UploadDoc>('products').find(category ? { category } : {}, { projection: { image: 0 } }).sort({ createdAt: -1 }).toArray(),
    db.collection<OverrideDoc>('product_overrides').find({}, { projection: { image: 0 } }).toArray(),
  ])
  const overrideById = new Map(overrides.map((doc) => [doc.id, doc]))

  const uploaded = uploads.map((doc) => ({
    id: doc._id.toHexString(),
    category: doc.category,
    title: doc.title,
    description: doc.description,
    image: `/api/product-image?id=${doc._id.toHexString()}`,
    moq: 'MOQ 50 PCS',
    tag: 'kit' as const,
    source: 'upload' as const,
  }))

  const builtin = showcaseProducts.map((product) => {
    const edit = overrideById.get(product.id)
    return {
      ...product,
      title: edit?.title ?? product.title,
      description: edit?.description ?? product.description,
      category: edit?.category ?? product.category,
      image: edit?.contentType ? `/api/product-image?id=${product.id}&v=${edit.updatedAt.getTime()}` : product.image,
      source: 'builtin' as const,
      edited: !!edit,
      hidden: !!edit?.hidden,
    }
  }).filter((product) => (!category || product.category === category) && (includeHidden || !product.hidden))

  return Response.json({ products: [...uploaded, ...builtin] }, {
    headers: { 'Cache-Control': includeHidden ? 'no-store' : 'public, max-age=0, s-maxage=30, stale-while-revalidate=300' },
  })
}

async function create(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return Response.json({ error: 'Invalid request.' }, { status: 400 })
  const category = clean(body.category, 80)
  const title = clean(body.title, 120)
  const description = clean(body.description, 300)
  const image = parseImage(body.image)
  if (!categories.has(category)) return Response.json({ error: 'Choose a valid category.' }, { status: 400 })
  if (!title) return Response.json({ error: 'Add a product title.' }, { status: 400 })
  if (!image) return Response.json({ error: 'Upload a WebP, JPEG or PNG image.' }, { status: 400 })
  if ('error' in image) return Response.json({ error: image.error }, { status: 400 })

  const db = await getDb()
  const result = await db.collection('products').insertOne({ category, title, description, ...image, createdAt: new Date() })
  return Response.json({ id: result.insertedId.toHexString() }, { status: 201 })
}

async function edit(request: Request, id: string) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return Response.json({ error: 'Invalid request.' }, { status: 400 })
  const changes: Record<string, unknown> = {}
  if (body.title !== undefined) {
    const title = clean(body.title, 120)
    if (!title) return Response.json({ error: 'Add a product title.' }, { status: 400 })
    changes.title = title
  }
  if (body.description !== undefined) changes.description = clean(body.description, 300)
  if (body.category !== undefined) {
    const category = clean(body.category, 80)
    if (!categories.has(category)) return Response.json({ error: 'Choose a valid category.' }, { status: 400 })
    changes.category = category
  }
  const image = parseImage(body.image)
  if (image && 'error' in image) return Response.json({ error: image.error }, { status: 400 })
  if (image) Object.assign(changes, image)

  const db = await getDb()
  if (objectIdPattern.test(id)) {
    const result = await db.collection('products').updateOne({ _id: new ObjectId(id) }, { $set: changes })
    if (!result.matchedCount) return Response.json({ error: 'Product not found.' }, { status: 404 })
  } else {
    if (!builtinById.has(id)) return Response.json({ error: 'Product not found.' }, { status: 404 })
    await db.collection('product_overrides').updateOne({ id }, { $set: { ...changes, id, updatedAt: new Date() } }, { upsert: true })
  }
  return Response.json({ ok: true })
}

async function remove(id: string) {
  const db = await getDb()
  if (objectIdPattern.test(id)) {
    await db.collection('products').deleteOne({ _id: new ObjectId(id) })
  } else {
    if (!builtinById.has(id)) return Response.json({ error: 'Product not found.' }, { status: 404 })
    // Built-in designs ship with the code, so "delete" hides them until restored.
    await db.collection('product_overrides').updateOne({ id }, { $set: { id, hidden: true, updatedAt: new Date() } }, { upsert: true })
  }
  return Response.json({ ok: true })
}

async function restore(id: string) {
  if (!builtinById.has(id)) return Response.json({ error: 'Only built-in designs can be restored.' }, { status: 400 })
  const db = await getDb()
  await db.collection('product_overrides').deleteOne({ id })
  return Response.json({ ok: true })
}

export async function handleProducts(request: Request): Promise<Response> {
  try {
    if (request.method === 'GET') return await list(request)
    if (!['POST', 'PATCH', 'DELETE'].includes(request.method)) return Response.json({ error: 'Method not allowed.' }, { status: 405 })
    if (!isAdmin(request)) return Response.json({ error: 'Please sign in again.' }, { status: 401 })
    const params = new URL(request.url).searchParams
    const id = params.get('id') ?? ''
    if (request.method === 'POST') return params.get('action') === 'restore' ? await restore(id) : await create(request)
    if (!id) return Response.json({ error: 'Missing product id.' }, { status: 400 })
    return request.method === 'PATCH' ? await edit(request, id) : await remove(id)
  } catch (error) {
    console.error('products api failed', error)
    return Response.json({ error: 'Server error. Try again.' }, { status: 500 })
  }
}

export default { fetch: handleProducts }
