// Serverless quote handler. Runs on the host, never in the browser.
// Required server environment variables:
//   RESEND_API_KEY   API key for the Resend email service
//   QUOTE_FROM       Verified sender, e.g. "ZED MEGA <quotes@yourdomain.com>"
//   QUOTE_ADMIN_TO   Address that receives new quote requests
//   MONGODB_URI      Optional; when set, every request is also saved (see _db.ts)
//   VAPID_*          Optional; when set, admin devices get a push notification (see _push.ts)

import { getDb } from './_db.js'
import { notifyAdmins } from './_push.js'
import { activewear, sports } from './_categories.js'

type QuoteInput = {
  name: string
  company: string
  email: string
  phone: string
  product: string
  quantity: number
  details: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const products = new Set([...sports, ...activewear])

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function parse(body: unknown): { data?: QuoteInput; error?: string } {
  if (!body || typeof body !== 'object') return { error: 'Invalid request.' }
  const raw = body as Record<string, unknown>
  const data: QuoteInput = {
    name: clean(raw.name, 120),
    company: clean(raw.company, 160),
    email: clean(raw.email, 254),
    phone: clean(raw.phone, 40),
    product: clean(raw.product, 80),
    quantity: Number(raw.quantity),
    details: clean(raw.details, 4000),
  }
  if (!data.name) return { error: 'Enter your name.' }
  if (!emailPattern.test(data.email)) return { error: 'Enter a valid email address.' }
  if (!products.has(data.product)) return { error: 'Choose a product type.' }
  if (!Number.isInteger(data.quantity) || data.quantity < 50) return { error: 'The minimum order is 50 pieces per style.' }
  if (!data.details) return { error: 'Describe the garments you need.' }
  return { data }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

async function send(to: string, subject: string, html: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.QUOTE_FROM, to, subject, html }),
  })
  if (!response.ok) throw new Error(`Email provider responded ${response.status}`)
}

export async function handleQuote(request: Request): Promise<Response> {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  if (!process.env.RESEND_API_KEY || !process.env.QUOTE_FROM || !process.env.QUOTE_ADMIN_TO) {
    return Response.json({ error: 'Quote service is not configured.' }, { status: 500 })
  }

  let parsed: ReturnType<typeof parse>
  try {
    parsed = parse(await request.json())
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }
  if (!parsed.data) return Response.json({ error: parsed.error }, { status: 400 })
  const q = parsed.data

  // Save first so a request is never lost if email fails. A database outage must not block the quote.
  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb()
      await db.collection('quotes').insertOne({ ...q, status: 'new', createdAt: new Date() })
    } catch (error) {
      console.error('Could not save quote to MongoDB', error)
    }
  }

  // Ping admin phones before email, so the team hears about it even if email is down.
  try {
    await notifyAdmins({ title: `New quote: ${q.product}`, body: `${q.name}${q.company ? ` (${q.company})` : ''} · ${q.quantity} pcs`, url: '/admin', tag: 'quote' })
  } catch (error) {
    console.error('Could not send admin push', error)
  }

  const rows = [
    ['Name', q.name], ['Company', q.company || '-'], ['Email', q.email], ['Phone', q.phone || '-'],
    ['Product', q.product], ['Quantity', `${q.quantity} pieces`], ['Details', q.details],
  ]
  const table = rows.map(([k, v]) => `<tr><td><b>${escapeHtml(k)}</b></td><td>${escapeHtml(v).replace(/\n/g, '<br>')}</td></tr>`).join('')

  try {
    await send(process.env.QUOTE_ADMIN_TO, `New quote request: ${q.product}, ${q.quantity} pcs`, `<table>${table}</table>`)
  } catch {
    return Response.json({ error: 'We could not send your request. Please try again or message us on WhatsApp.' }, { status: 502 })
  }
  // The team already has the request; a failed confirmation must not make the visitor resubmit.
  try {
    await send(q.email, 'We received your ZED MEGA quote request', `<p>Hi ${escapeHtml(q.name)},</p><p>Thank you. We received your request for ${q.quantity} ${escapeHtml(q.product)} pieces and will reply with pricing and next steps.</p><p>ZED MEGA Clothing Industry, Sialkot</p>`)
  } catch (error) {
    console.error('Could not send quote confirmation', error)
  }
  return Response.json({ ok: true })
}

export default { fetch: handleQuote }
