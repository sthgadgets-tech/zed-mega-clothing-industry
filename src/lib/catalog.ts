import { useSyncExternalStore } from 'react'
import { showcaseProducts } from '../../api/_showcase'

// The live catalogue from /api/products: built-in designs with admin edits applied,
// hidden ones removed, plus admin uploads. Until it loads (or if the API is down)
// the built-in list is shown, so pages never render empty.

export type CatalogProduct = {
  id: string
  title: string
  category: string
  tag?: 'team' | 'active' | 'outer' | 'kit'
  image: string
  description: string
  moq: string
  // Extra photos after the main one, added from the admin panel.
  gallery?: string[]
}

let products: CatalogProduct[] = showcaseProducts
let requested = false
const listeners = new Set<() => void>()

function load() {
  requested = true
  fetch('/api/products')
    .then((response) => (response.ok ? response.json() : null))
    .then((data: { products?: CatalogProduct[] } | null) => {
      if (!data?.products) return
      products = data.products
      listeners.forEach((listener) => listener())
    })
    .catch(() => {})
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!requested) load()
  return () => { listeners.delete(listener) }
}

export function useCatalog() {
  return useSyncExternalStore(subscribe, () => products, () => products)
}
