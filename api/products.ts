// Admin-uploaded catalogue photos, stored in MongoDB (see _db.ts).
//   GET    /api/products?category=Baseball   public list for one category (or all without it)
//   POST   /api/products                     admin: { category, title, description, image: "data:image/webp;base64,..." }
//   DELETE /api/products?id=<id>             admin
// Image bytes are served by /api/product-image.

import { Binary, ObjectId } from 'mongodb'
import { getDb } from './_db.js'
import { verifyToken } from './_auth.js'
import { activewear, sports } from './_categories.js'

const categories = new Set([...sports, ...activewear])
const MAX_IMAGE_BYTES = 3 * 1024 * 1024
const imagePattern = /^data:(image\/(?:webp|jpeg|png));base64,([A-Za-z0-9+/=]+)$/

type ProductDoc = { _id: ObjectId; category: string; title: string; description: string; contentType: string; image: Binary; createdAt: Date }

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function isAdmin(request: Request) {
  return verifyToken(request.headers.get('authorization')?.replace(/^Bearer\s+/i, ''))
}

async function list(request: Request) {
  const category = new URL(request.url).searchParams.get('category')
  const db = await getDb()
  const docs = await db.collection<ProductDoc>('products')
    .find(category ? { category } : {}, { projection: { image: 0 } })
    .sort({ createdAt: -1 })
    .toArray()
  const products = docs.map((doc) => ({
    id: doc._id.toHexString(),
    category: doc.category,
    title: doc.title,
    description: doc.description,
    image: `/api/product-image?id=${doc._id.toHexString()}`,
    moq: 'MOQ 50 PCS',
  }))
  return Response.json({ products }, { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' } })
}

async function create(request: Request) {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const category = clean(body.category, 80)
  const title = clean(body.title, 120)
  const description = clean(body.description, 300)
  const match = typeof body.image === 'string' ? imagePattern.exec(body.image) : null
  if (!categories.has(category)) return Response.json({ error: 'Choose a valid category.' }, { status: 400 })
  if (!title) return Response.json({ error: 'Add a product title.' }, { status: 400 })
  if (!match) return Response.json({ error: 'Upload a WebP, JPEG or PNG image.' }, { status: 400 })
  const bytes = Buffer.from(match[2], 'base64')
  if (bytes.length > MAX_IMAGE_BYTES) return Response.json({ error: 'Image is larger than 3 MB.' }, { status: 413 })

  const db = await getDb()
  const result = await db.collection('products').insertOne({ category, title, description, contentType: match[1], image: new Binary(bytes), createdAt: new Date() })
  return Response.json({ id: result.insertedId.toHexString() }, { status: 201 })
}

async function remove(request: Request) {
  const id = new URL(request.url).searchParams.get('id') ?? ''
  if (!ObjectId.isValid(id)) return Response.json({ error: 'Invalid id.' }, { status: 400 })
  const db = await getDb()
  await db.collection('products').deleteOne({ _id: new ObjectId(id) })
  return Response.json({ ok: true })
}

export async function handleProducts(request: Request): Promise<Response> {
  try {
    if (request.method === 'GET') return await list(request)
    if (request.method !== 'POST' && request.method !== 'DELETE') return Response.json({ error: 'Method not allowed.' }, { status: 405 })
    if (!isAdmin(request)) return Response.json({ error: 'Please sign in again.' }, { status: 401 })
    return request.method === 'POST' ? await create(request) : await remove(request)
  } catch (error) {
    console.error('products api failed', error)
    return Response.json({ error: 'Server error. Try again.' }, { status: 500 })
  }
}

export default { fetch: handleProducts }
