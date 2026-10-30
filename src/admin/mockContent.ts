import type { Category, MediaAsset, SiteContent } from './types'

const entry = (id: string, heading: string, body: string) => ({ id, heading, body, enabled: true })

export const initialContent: SiteContent = {
  hero: {
    heading: 'Built for performance. Made for your brand.',
    body: 'Custom sportswear and private-label apparel engineered around your designs, your team, and your brand.',
    primaryText: 'Get a free quote',
    primaryLink: '/quote',
    secondaryText: 'Explore products',
    secondaryLink: '#categories',
    overlayStrength: 75,
  },
  audience: [
    entry('aud-1', 'Sportswear brands', 'Private-label collections, produced around your fit, identity, and commercial calendar.'),
    entry('aud-2', 'Teamwear companies', 'Reliable kit programs for teams that need consistency across every season.'),
    entry('aud-3', 'Clubs and leagues', 'Match-day uniforms and training layers that look unified on and off the field.'),
    entry('aud-4', 'Schools and universities', 'Flexible size runs and durable apparel for campus communities.'),
    entry('aud-5', 'Gyms and studios', 'Premium activewear for members, coaches, and branded retail.'),
    entry('aud-6', 'Corporate and events', 'Custom apparel that turns a team moment into something people keep.'),
  ],
  ordering: [
    entry('order-1', 'Share your design', 'Send a design file, sketch, or reference image. We respond with pricing and lead time.'),
    entry('order-2', 'Approve your sample', 'See and feel a sample made to your specifications before bulk production starts.'),
    entry('order-3', 'Bulk production', 'Once approved, your order moves into a controlled production schedule.'),
    entry('order-4', 'Worldwide delivery', 'We pack to your requirements and coordinate the best route to your destination.'),
  ],
  specifications: [
    entry('spec-1', 'Design and colours', 'Your artwork, colour palette, and references stay yours.'),
    entry('spec-2', 'Fabrics', 'Performance knits, fleece, mesh, cotton blends, and custom sourcing.'),
    entry('spec-3', 'Printing and decoration', 'Sublimation, screen print, embroidery, heat transfer, and patches.'),
    entry('spec-4', 'Names and numbers', 'Player personalization and mixed size runs within your order.'),
    entry('spec-5', 'Sizes', 'Your size chart or our base blocks, graded to the required range.'),
    entry('spec-6', 'Private labels and packaging', 'Neck labels, hang tags, care labels, and packaging with your brand.'),
    entry('spec-7', 'Minimum order quantity', 'From 50 pieces per style, with sizes mixed at no extra cost.'),
  ],
  testimonials: [
    { id: 'review-demo', quote: 'Authorized buyer testimonial goes here.', author: 'Unverified demo', verified: false, enabled: false },
  ],
  categories: [
    ...[
      ['American Football', '/images/products/product-10.jpg'],
      ['Baseball', '/images/products/product-07.jpg'],
      ['Basketball', '/images/products/product-04.jpg'],
      ['Soccer', '/images/products/product-11.jpg'],
      ['Rugby', '/images/products/product-27.jpg'],
      ['Ice Hockey', '/images/products/product-33.jpg'],
      ['Cricket', '/images/products/product-29.jpg'],
      ['Cycling', '/images/products/product-35.jpg'],
      ['Golf', '/images/products/product-08.jpg'],
      ['Tennis', '/images/products/product-34.jpg'],
    ].map(([name, imagePath], index) => ({ id: `sports-${index}`, group: 'sportswear' as const, name, href: '/quote', imagePath, enabled: true })),
    ...[
      ['Hoodies', '/images/products/product-14.jpg'],
      ['Jackets', '/images/products/product-17.jpg'],
      ['Sports Bras', '/images/products/product-05.jpg'],
      ['Leggings', '/images/products/product-26.jpg'],
      ['Sweatshirts', '/images/products/product-22.jpg'],
      ['T-Shirts', '/images/products/product-13.jpg'],
      ['Shorts', '/images/products/product-12.jpg'],
      ['Joggers', '/images/products/product-17.jpg'],
    ].map(([name, imagePath], index) => ({ id: `active-${index}`, group: 'activewear' as const, name, href: '/quote', imagePath, enabled: true })),
  ],
  manufacturing: [
    entry('process-1', 'Pattern making', 'Your design is translated into production-ready patterns and graded sizes.'),
    entry('process-2', 'Pre-production sampling', 'We make a physical sample so fit, fabric, and decoration can be approved.'),
    entry('process-3', 'Material sourcing', 'We match performance fabrics and trims to the intended use and hand feel.'),
    entry('process-4', 'Cutting and printing', 'Panels are cut accurately, then printed, embroidered, or heat-applied.'),
    entry('process-5', 'Sewing and quality control', 'Experienced operators assemble and inspect every production run.'),
    entry('process-6', 'Packaging and shipping', 'Your labels and packing plan are applied before worldwide dispatch.'),
  ],
  shipping: [
    entry('ship-1', 'Worldwide destinations', 'We work with buyers globally; courier and shipping terms are agreed in each quote.'),
  ],
  faq: [
    entry('faq-1', 'What is your minimum order quantity?', 'Our standard minimum is 50 pieces per style. Sizes can be mixed within that order.'),
    entry('faq-2', 'Can I use my own design and labels?', 'Yes. You provide the artwork, labels, packaging requirements, and size chart; we build around them.'),
    entry('faq-3', 'How long does sampling take?', 'A first sample typically takes around seven days after the design and specifications are confirmed.'),
    entry('faq-4', 'Which countries do you ship to?', 'We work with buyers globally. Your quote includes the destination, preferred courier, and agreed shipping terms.'),
  ],
  settings: {
    email: 'zhr.zedmega@gmail.com',
    phone: '+92 328 625 0355',
    whatsapp: '923286250355',
    address: 'Sharay Da Koat, Jaserwala, Daska, Sialkot, Pakistan',
    footerBlurb: 'Custom sportswear and private-label activewear from Sialkot, Pakistan. Made around your design.',
    copyright: '© 2026 ZED MEGA Clothing Industry',
    instagramUrl: '',
    linkedinUrl: '',
  },
}

const media = (id: string, name: string, src: string, usedBy: string[]): MediaAsset => ({
  id, name, src, altText: name, description: 'Existing project image', width: null, height: null, sizeBytes: null, usedBy, isSession: false,
})

export const initialMedia: MediaAsset[] = [
  media('logo', 'ZED MEGA logo', '/images/zedmega-logo.jpg', ['Header logo', 'Admin brand']),
  media('shield', 'Shield emblem', '/images/logo-shield.jpg', ['Brand assets']),
  media('texture', 'Blue texture', '/images/texture-blue.jpg', ['Hero background', 'Manufacturing process']),
  ...Array.from({ length: 38 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0')
    return media(`product-${num}`, `ZED MEGA Production #${num}`, `/images/products/product-${num}.jpg`, ['Showcase carousel', 'Product categories'])
  }),
]

export function cloneInitialContent(): SiteContent {
  return JSON.parse(JSON.stringify(initialContent)) as SiteContent
}

export function cloneInitialMedia(): MediaAsset[] {
  return JSON.parse(JSON.stringify(initialMedia)) as MediaAsset[]
}

export function isCategory(value: unknown): value is Category {
  if (!value || typeof value !== 'object') return false
  const row = value as Partial<Category>
  return typeof row.id === 'string' && typeof row.name === 'string' && (row.group === 'sportswear' || row.group === 'activewear')
}
