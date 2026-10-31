// Serves the bytes of a catalogue photo stored in MongoDB: GET /api/product-image?id=<id>
// A 24-hex id is an admin upload (`products`); any other id is a built-in design whose
// photo was replaced from the admin panel (`product_overrides`).

import { ObjectId, type Binary } from 'mongodb'
import { getDb } from './_db.js'

export async function handleProductImage(request: Request): Promise<Response> {
  const id = new URL(request.url).searchParams.get('id') ?? ''
  if (!id || id.length > 64) return new Response('Not found', { status: 404 })
  const db = await getDb()
  const doc = /^[a-f0-9]{24}$/.test(id)
    ? await db.collection<{ contentType: string; image: Binary }>('products').findOne({ _id: new ObjectId(id) }, { projection: { contentType: 1, image: 1 } })
    : await db.collection<{ contentType?: string; image?: Binary }>('product_overrides').findOne({ id }, { projection: { contentType: 1, image: 1 } })
  if (!doc?.image || !doc.contentType) return new Response('Not found', { status: 404 })
  // Uploads never change their id, and replaced built-in photos carry ?v=<updatedAt>, so cache for good.
  return new Response(new Uint8Array(doc.image.buffer), { headers: { 'Content-Type': doc.contentType, 'Cache-Control': 'public, max-age=31536000, immutable' } })
}

export default { fetch: handleProductImage }
