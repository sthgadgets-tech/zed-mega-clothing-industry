import { cloneInitialContent, isCategory } from './mockContent'
import type { SiteContent } from './types'

// Drafts live only in this browser. They are not shared, not published, and not
// protected: anyone with access to this browser profile can read or change them.
const STORAGE_KEY = 'zedmega-admin-local-draft-v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

// Only the fields the editor reads are checked. A malformed or stale draft falls
// back to the seeded content instead of crashing the admin screen.
function isSiteContent(value: unknown): value is SiteContent {
  if (!isRecord(value)) return false
  const hero = value.hero
  const settings = value.settings
  return (
    isRecord(hero) && typeof hero.heading === 'string' &&
    isRecord(settings) && typeof settings.email === 'string' &&
    Array.isArray(value.audience) && Array.isArray(value.ordering) &&
    Array.isArray(value.specifications) && Array.isArray(value.testimonials) &&
    Array.isArray(value.categories) && value.categories.every(isCategory) &&
    Array.isArray(value.manufacturing) && Array.isArray(value.shipping) &&
    Array.isArray(value.faq)
  )
}

export function loadDraft(): SiteContent {
  if (typeof window === 'undefined') return cloneInitialContent()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return cloneInitialContent()
    const parsed: unknown = JSON.parse(raw)
    return isSiteContent(parsed) ? parsed : cloneInitialContent()
  } catch {
    return cloneInitialContent()
  }
}

export function saveDraft(content: SiteContent): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
    return true
  } catch {
    // Storage can be full or blocked (private mode). The caller shows an error.
    return false
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}
