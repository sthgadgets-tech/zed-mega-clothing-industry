ZED MEGA Clothing Industry — React/Vite site

Development
- npm install
- npm run dev
- npm run build

Public pages
- / — homepage
- /quote — quote request form (Vercel function sends email once Resend env vars are configured)

Local admin prototype
- Sign in at /admin/login with ADMIN_USERNAME / ADMIN_PASSWORD set in the Vercel environment variables (checked by api/admin-login.ts).
- These credentials are in the JavaScript bundle (src/admin/auth.ts), so anyone can read them from the source. The gate only keeps casual visitors out of this browser's admin screens. It does not protect data. Replace it with server-verified authentication (for example Supabase Auth) before using the admin for real content.
- Open /admin for the dashboard after signing in. Other pages: /admin/homepage, /admin/categories, /admin/media, /admin/faq, and /admin/settings.
- This is a LOCAL PREVIEW ONLY. There is no secure admin login, cloud database, persistent media storage, audit log, or publishing to the public website.
- Text drafts are stored in this browser's localStorage under zedmega-admin-local-draft-v1. Anyone with access to this browser profile can view or change them. Use Reset demo data in the editor, or clear that localStorage key in browser developer tools.
- Media uploads are temporary object-URL previews in the current browser session. They are not uploaded, shared, or published; refreshing or closing the tab discards them.
- Dashboard figures are seeded demo-content counts, not analytics or real activity. Unverified testimonial placeholders remain unpublished.

Production CMS requirements
To make this a real secure CMS, configure Supabase Auth, PostgreSQL with RLS, and Supabase Storage; add administrator role policies and server-side publishing; then migrate public section content to read the published database records. Do not deploy the local prototype as a secure admin system. Never put a Supabase service-role key or other server secret in VITE_ variables or browser code.

Quote email configuration
Set RESEND_API_KEY, QUOTE_FROM (a verified sender), and QUOTE_ADMIN_TO as Vercel server environment variables. These values are not in the repository. A deployment without them returns a configuration error from /api/quote.
