// Writes public/sitemap.xml before each build from the category list in api/_categories.ts,
// so a new category shows up in Google Search Console without editing XML by hand.
import { readFileSync, writeFileSync } from 'node:fs'

const SITE = 'https://www.zedmega.com'
const source = readFileSync(new URL('../api/_categories.ts', import.meta.url), 'utf8')
const categories = [...source.matchAll(/'([^']+)'/g)].map((match) => match[1])
const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const today = new Date().toISOString().slice(0, 10)

const pages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/quote', priority: '0.9', changefreq: 'monthly' },
  ...categories.map((name) => ({ path: `/category/${slugify(name)}`, priority: '0.8', changefreq: 'weekly' })),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(({ path, priority, changefreq }) => `  <url>
    <loc>${SITE}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>
`

writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml)
console.log(`sitemap.xml: ${pages.length} URLs`)
