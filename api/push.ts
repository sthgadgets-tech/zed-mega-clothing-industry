// Admin push subscriptions (see _push.ts).
//   GET    /api/push                 public VAPID key the browser needs to subscribe
//   POST   /api/push                 admin: save { subscription }
//   POST   /api/push?action=test     admin: send a test notification to every admin device
//   DELETE /api/push                 admin: remove { endpoint }

import { getDb } from './_db.js'
import { verifyToken } from './_auth.js'
import { isPushConfigured, notifyAdmins } from './_push.js'

function isAdmin(request: Request) {
  return verifyToken(request.headers.get('authorization')?.replace(/^Bearer\s+/i, ''))
}

export async function handlePush(request: Request): Promise<Response> {
  if (request.method === 'GET') {
    if (!isPushConfigured()) return Response.json({ error: 'Notifications are not configured on the server.' }, { status: 503 })
    return Response.json({ publicKey: process.env.VAPID_PUBLIC_KEY })
  }
  if (request.method !== 'POST' && request.method !== 'DELETE') return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  if (!isAdmin(request)) return Response.json({ error: 'Please sign in again.' }, { status: 401 })
  if (!isPushConfigured()) return Response.json({ error: 'Notifications are not configured on the server.' }, { status: 503 })

  try {
    if (new URL(request.url).searchParams.get('action') === 'test') {
      await notifyAdmins({ title: 'ZED MEGA Admin', body: 'Notifications are working on this device.', url: '/admin', tag: 'test' })
      return Response.json({ ok: true })
    }

    const body = (await request.json().catch(() => ({}))) as { subscription?: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } }; endpoint?: unknown }
    const db = await getDb()
    const subscriptions = db.collection('push_subscriptions')

    if (request.method === 'DELETE') {
      if (typeof body.endpoint === 'string') await subscriptions.deleteOne({ endpoint: body.endpoint })
      return Response.json({ ok: true })
    }

    const sub = body.subscription
    const endpoint = sub?.endpoint
    const p256dh = sub?.keys?.p256dh
    const auth = sub?.keys?.auth
    if (typeof endpoint !== 'string' || !endpoint.startsWith('https://') || typeof p256dh !== 'string' || typeof auth !== 'string') {
      return Response.json({ error: 'Invalid subscription.' }, { status: 400 })
    }
    await subscriptions.updateOne(
      { endpoint },
      { $set: { endpoint, keys: { p256dh, auth }, userAgent: request.headers.get('user-agent')?.slice(0, 200) ?? '', updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    )
    return Response.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error('push api failed', error)
    return Response.json({ error: 'Server error. Try again.' }, { status: 500 })
  }
}

export default { fetch: handlePush }
