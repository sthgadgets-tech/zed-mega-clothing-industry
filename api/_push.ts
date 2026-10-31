// Web push to admin devices. Runs on the host, never in the browser.
// Required server environment variables:
//   VAPID_PUBLIC_KEY    from `npx web-push generate-vapid-keys`
//   VAPID_PRIVATE_KEY   from the same command; keep secret
//   VAPID_SUBJECT       contact URL for push services, e.g. "mailto:you@example.com"

import webpush from 'web-push'
import { getDb } from './_db'

export type PushPayload = { title: string; body: string; url?: string; tag?: string }

export function isPushConfigured() {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT)
}

// Sends to every subscribed admin device and drops subscriptions the push service says are gone.
export async function notifyAdmins(payload: PushPayload) {
  if (!isPushConfigured() || !process.env.MONGODB_URI) return
  webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!)
  const db = await getDb()
  const subscriptions = await db.collection<{ endpoint: string; keys: { p256dh: string; auth: string } }>('push_subscriptions').find().toArray()
  const message = JSON.stringify(payload)
  await Promise.all(subscriptions.map(async ({ endpoint, keys }) => {
    try {
      await webpush.sendNotification({ endpoint, keys }, message, { TTL: 60 * 60 * 24, urgency: 'high' })
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode
      if (status === 404 || status === 410) await db.collection('push_subscriptions').deleteOne({ endpoint })
      else console.error('Push failed', status, error)
    }
  }))
}
