// Serves the bytes of an admin-uploaded catalogue photo: GET /api/product-image?id=<id>

import { ObjectId, type Binary } from 'mongodb'
import { getDb } from './_db'

export async function handleProductImage(request: Request): Promise<Response> {
  const id = new URL(request.url).searchParams.get('id') ?? ''
  if (!ObjectId.isValid(id)) return new Response('Not found', { status: 404 })
  const db = await getDb()
  const doc = await db.collection<{ contentType: string; image: Binary }>('products').findOne({ _id: new ObjectId(id) }, { projection: { contentType: 1, image: 1 } })
  if (!doc) return new Response('Not found', { status: 404 })
  // Ids never get reused, so the bytes behind one can be cached for good.
  return new Response(doc.image.buffer, { headers: { 'Content-Type': doc.contentType, 'Cache-Control': 'public, max-age=31536000, immutable' } })
}

export default { fetch: handleProductImage }
