// Checks admin credentials against server environment variables (see _auth.ts)
// and returns a signed session token. The credentials never reach the browser bundle.

import { checkCredentials, createToken, isAuthConfigured } from './_auth'

export async function handleAdminLogin(request: Request): Promise<Response> {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  if (!isAuthConfigured()) return Response.json({ error: 'Admin sign-in is not configured.' }, { status: 500 })

  let username = ''
  let password = ''
  try {
    const body = (await request.json()) as Record<string, unknown>
    username = typeof body.username === 'string' ? body.username.trim() : ''
    password = typeof body.password === 'string' ? body.password : ''
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (!checkCredentials(username, password)) {
    return Response.json({ error: 'Incorrect username or password.' }, { status: 401 })
  }
  return Response.json({ token: createToken() })
}

export default { fetch: handleAdminLogin }
