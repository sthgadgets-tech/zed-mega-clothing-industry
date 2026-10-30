// Shapes for the local admin prototype. Nothing here reaches the public site yet;
// the homepage still renders its own copy from src/App.tsx.

export type Entry = {
  id: string
  heading: string
  body: string
  enabled: boolean
}

export type Testimonial = {
  id: string
  quote: string
  author: string
  // Only verified testimonials may be enabled. The editor enforces this.
  verified: boolean
  enabled: boolean
}

export type Category = {
  id: string
  group: 'sportswear' | 'activewear'
  name: string
  href: string
  imagePath: string
  enabled: boolean
}

export type Hero = {
  heading: string
  body: string
  primaryText: string
  primaryLink: string
  secondaryText: string
  secondaryLink: string
  overlayStrength: number
}

export type Settings = {
  email: string
  phone: string
  whatsapp: string
  address: string
  footerBlurb: string
  copyright: string
  instagramUrl: string
  linkedinUrl: string
}

export type SiteContent = {
  hero: Hero
  audience: Entry[]
  ordering: Entry[]
  specifications: Entry[]
  testimonials: Testimonial[]
  categories: Category[]
  manufacturing: Entry[]
  shipping: Entry[]
  faq: Entry[]
  settings: Settings
}

export type MediaAsset = {
  id: string
  name: string
  src: string
  altText: string
  description: string
  width: number | null
  height: number | null
  sizeBytes: number | null
  // Sections that use this image. Seeded assets list their code locations;
  // uploaded assets start empty and gain usage when a category references them.
  usedBy: string[]
  // True for files uploaded in this browser session. Those exist only in memory.
  isSession: boolean
}

export const SECTION_LABELS: Record<keyof SiteContent, string> = {
  hero: 'Hero',
  audience: 'Who we make for',
  ordering: 'How ordering works',
  specifications: 'Specifications',
  testimonials: 'Testimonials',
  categories: 'Product categories',
  manufacturing: 'Manufacturing process',
  shipping: 'Worldwide shipping',
  faq: 'FAQs',
  settings: 'Footer and contact',
}

// Everything except the site-wide footer and contact group appears on the homepage.
export const HOMEPAGE_SECTION_KEYS: (keyof SiteContent)[] = [
  'hero',
  'audience',
  'ordering',
  'specifications',
  'testimonials',
  'categories',
  'manufacturing',
  'shipping',
  'faq',
]
