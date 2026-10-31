// Category cover photos uploaded from the admin panel, stored in MongoDB (see _db.ts).
//   GET    /api/category-covers                  public map of { category: imageUrl } for categories with an upload
//   GET    /api/category-covers?image=<category> the image bytes
//   POST   /api/category-covers                  admin: { category, image: "data:image/webp;base64,..." }
//   DELETE /api/category-covers?category=<name>  admin: back to the built-in cover

import { Binary } from 'mongodb'
import { getDb } from './_db.js'
import { verifyToken } from './_auth.js'
import { activewear, sports } from './_categories.js'

const categories = new Set([...sports, ...activewear])
const MAX_IMAGE_BYTES = 3 * 1024 * 1024
const imagePattern = /^data:(image\/(?:webp|jpeg|png));base64,([A-Za-z0-9+/=]+)$/

type CoverDoc = { category: string; contentType: string; image: Binary; updatedAt: Date }

function isAdmin(request: Request) {
  return verifyToken(request.headers.get('authorization')?.replace(/^Bearer\s+/i, ''))
}

async function covers() {
  const db = await getDb()
  return db.collection<CoverDoc>('category_covers')
}

export async function handleCategoryCovers(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url)

    if (request.method === 'GET') {
      const imageFor = url.searchParams.get('image')
      if (imageFor) {
        const doc = await (await covers()).findOne({ category: imageFor })
        if (!doc) return new Response('Not found', { status: 404 })
        // The URL carries ?v=<updatedAt>, so each upload gets a fresh cache entry.
        return new Response(new Uint8Array(doc.image.buffer), { headers: { 'Content-Type': doc.contentType, 'Cache-Control': 'public, max-age=31536000, immutable' } })
      }
      const docs = await (await covers()).find({}, { projection: { image: 0 } }).toArray()
      const map = Object.fromEntries(docs.map((doc) => [doc.category, `/api/category-covers?image=${encodeURIComponent(doc.category)}&v=${doc.updatedAt.getTime()}`]))
      return Response.json({ covers: map }, { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=300' } })
    }

    if (request.method !== 'POST' && request.method !== 'DELETE') return Response.json({ error: 'Method not allowed.' }, { status: 405 })
    if (!isAdmin(request)) return Response.json({ error: 'Please sign in again.' }, { status: 401 })

    if (request.method === 'DELETE') {
      await (await covers()).deleteOne({ category: url.searchParams.get('category') ?? '' })
      return Response.json({ ok: true })
    }

    const body = (await request.json().catch(() => ({}))) as { category?: unknown; image?: unknown }
    const category = typeof body.category === 'string' ? body.category : ''
    const match = typeof body.image === 'string' ? imagePattern.exec(body.image) : null
    if (!categories.has(category)) return Response.json({ error: 'Choose a valid category.' }, { status: 400 })
    if (!match) return Response.json({ error: 'Upload a WebP, JPEG or PNG image.' }, { status: 400 })
    const bytes = Buffer.from(match[2], 'base64')
    if (bytes.length > MAX_IMAGE_BYTES) return Response.json({ error: 'Image is larger than 3 MB.' }, { status: 413 })

    await (await covers()).updateOne(
      { category },
      { $set: { category, contentType: match[1], image: new Binary(bytes), updatedAt: new Date() } },
      { upsert: true },
    )
    return Response.json({ ok: true })
  } catch (error) {
    console.error('category covers api failed', error)
    return Response.json({ error: 'Server error. Try again.' }, { status: 500 })
  }
}

export default { fetch: handleCategoryCovers }
