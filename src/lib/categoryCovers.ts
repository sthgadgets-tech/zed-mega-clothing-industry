import { useSyncExternalStore } from 'react'

// Cover photos uploaded from the admin panel (/api/category-covers), fetched once
// per page load and shared by every component that shows a category image.

let covers: Record<string, string> = {}
let requested = false
const listeners = new Set<() => void>()

export function refreshCategoryCovers() {
  requested = true
  return fetch('/api/category-covers', { cache: 'no-store' })
    .then((response) => (response.ok ? response.json() : { covers: {} }))
    .then((data: { covers?: Record<string, string> }) => {
      covers = data.covers ?? {}
      listeners.forEach((listener) => listener())
    })
    .catch(() => {})
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!requested) refreshCategoryCovers()
  return () => { listeners.delete(listener) }
}

// Returns the uploaded covers keyed by category name; empty until the request finishes.
export function useCategoryCovers() {
  return useSyncExternalStore(subscribe, () => covers, () => covers)
}
