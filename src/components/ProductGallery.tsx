import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

// Full-screen gallery for one design: the main photo first, then its extra photos.
export function ProductGallery({ title, photos, onClose }: { title: string; photos: string[]; onClose: () => void }) {
  const [index, setIndex] = useState(0)
  const count = photos.length
  const step = (delta: number) => setIndex((current) => (current + delta + count) % count)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    document.body.classList.add('nav-locked')
    return () => { window.removeEventListener('keydown', onKey); document.body.classList.remove('nav-locked') }
  }, [count])

  return (
    <div className="gallery-backdrop" role="dialog" aria-modal="true" aria-label={`${title} photos`} onClick={onClose}>
      <div className="gallery-box" onClick={(event) => event.stopPropagation()}>
        <div className="gallery-top">
          <strong>{title}</strong>
          <span>{index + 1} / {count}</span>
          <button type="button" className="gallery-close" onClick={onClose} aria-label="Close gallery"><X size={20} /></button>
        </div>
        <div className="gallery-stage">
          <img src={photos[index]} alt={`${title}, photo ${index + 1}`} />
          {count > 1 && <>
            <button type="button" className="gallery-nav is-prev" onClick={() => step(-1)} aria-label="Previous photo"><ChevronLeft size={24} /></button>
            <button type="button" className="gallery-nav is-next" onClick={() => step(1)} aria-label="Next photo"><ChevronRight size={24} /></button>
          </>}
        </div>
        {count > 1 && (
          <div className="gallery-thumbs">
            {photos.map((photo, i) => (
              <button type="button" key={photo} className={i === index ? 'is-active' : ''} onClick={() => setIndex(i)} aria-label={`Show photo ${i + 1}`}>
                <img src={photo} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
