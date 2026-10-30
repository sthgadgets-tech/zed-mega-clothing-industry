// Admin session tokens. Runs on the host, never in the browser.
// Required server environment variables:
//   ADMIN_USERNAME   Admin panel username
//   ADMIN_PASSWORD   Admin panel password
//   ADMIN_SECRET     Long random string used to sign session tokens

import { createHmac, timingSafeEqual } from 'node:crypto'

const SESSION_HOURS = 12

function sign(value: string) {
  return createHmac('sha256', process.env.ADMIN_SECRET!).update(value).digest('base64url')
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export function isAuthConfigured() {
  return !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET)
}

export function checkCredentials(username: string, password: string) {
  return safeEqual(username, process.env.ADMIN_USERNAME!) && safeEqual(password, process.env.ADMIN_PASSWORD!)
}

export function createToken() {
  const expires = String(Date.now() + SESSION_HOURS * 60 * 60 * 1000)
  return `${expires}.${sign(expires)}`
}

// For future admin API routes: pass the request's "Authorization: Bearer <token>" value.
export function verifyToken(token: string | null | undefined) {
  if (!token || !isAuthConfigured()) return false
  const [expires, signature] = token.split('.')
  if (!expires || !signature || Number(expires) < Date.now()) return false
  return safeEqual(signature, sign(expires))
}
