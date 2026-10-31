import { useState, useEffect, useRef } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Maximize2, Sparkles, X } from 'lucide-react'
import './product-carousel.css'

import { useCatalog } from '../lib/catalog'

const allImages = Array.from({ length: 51 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0')
  return `/images/products/product-${num}.webp`
}).filter((src) => !src.endsWith('product-39.webp')) // no product-39 image on disk

export function ProductCarousel() {
  const showcaseProducts = useCatalog()
  const [activeTab, setActiveTab] = useState<'all' | 'team' | 'active' | 'outer' | 'kit'>('all')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  // One slide width plus the track gap, measured so the slide lands flush at every screen size.
  const [step, setStep] = useState(280)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => {
      const slide = track.firstElementChild as HTMLElement | null
      if (!slide) return
      setStep(slide.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => observer.disconnect()
  }, [activeTab])
  // Phones get a shorter marquee: ~200 animated images is heavy on mobile CPUs.
  const [isSmall] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches)
  const marqueeSlots = Array.from({ length: (isSmall ? 12 : allImages.length) * 2 })

  const filteredProducts = activeTab === 'all'
    ? showcaseProducts
    : showcaseProducts.filter((p) => p.tag === activeTab)

  const itemsCount = filteredProducts.length

  // Auto-play timer
  useEffect(() => {
    if (isPaused || itemsCount <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % itemsCount)
    }, 3800)
    return () => clearInterval(timer)
  }, [isPaused, itemsCount])

  // Reset index when filter tab changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [activeTab])

  // Escape key closes modal
  useEffect(() => {
    if (previewIndex === null) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewIndex(null)
      if (e.key === 'ArrowRight') setPreviewIndex((prev) => (prev === null ? null : (prev + 1) % allImages.length))
      if (e.key === 'ArrowLeft') setPreviewIndex((prev) => (prev === null ? null : (prev === 0 ? allImages.length - 1 : prev - 1)))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [previewIndex])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? itemsCount - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % itemsCount)
  }

  return (
    <section className="product-carousel-section" id="showcase">
      <div className="container">
        {/* Header */}
        <div className="carousel-header">
          <div className="carousel-title-group">
            <p className="section-label section-label-light">
              <span />
              Manufactured By ZED MEGA
            </p>
            <h2>
              Live Production <span>Showcase.</span>
            </h2>
            <p>
              Inspect real uniforms, activewear collections, and accessories manufactured in our Sialkot factory for global brands and teams.
            </p>
          </div>

          <div className="carousel-controls">
            <button
              className="carousel-nav-btn"
              onClick={handlePrev}
              aria-label="Previous slide"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              className="carousel-nav-btn"
              onClick={handleNext}
              aria-label="Next slide"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="carousel-tabs" role="tablist">
          <button
            className={`carousel-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Products ({showcaseProducts.length})
          </button>
          <button
            className={`carousel-tab ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Team Sports
          </button>
          <button
            className={`carousel-tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Athleisure & Fitness
          </button>
          <button
            className={`carousel-tab ${activeTab === 'outer' ? 'active' : ''}`}
            onClick={() => setActiveTab('outer')}
          >
            Hoodies & Outerwear
          </button>
          <button
            className={`carousel-tab ${activeTab === 'kit' ? 'active' : ''}`}
            onClick={() => setActiveTab('kit')}
          >
            Custom Kits & Bags
          </button>
        </div>

        {/* Carousel Viewport */}
        <div
          className="carousel-viewport"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={trackRef}
            className="carousel-track"
            style={{
              transform: `translateX(-${currentIndex * step}px)`,
            }}
          >
            {filteredProducts.map((product) => (
              <div className="carousel-slide" key={product.id}>
                <div className="slide-image-wrapper">
                  <span className="slide-badge">{product.category}</span>
                  <img
                    src={product.image}
                    alt={product.title}
                    loading="lazy"
                  />
                  <div className="slide-overlay" />
                </div>
                <div className="slide-body">
                  <div>
                    <h3>{product.title}</h3>
                    <p>{product.description}</p>
                  </div>
                  <div className="slide-footer">
                    <span className="slide-moq">{product.moq}</span>
                    <a className="slide-link" href="/quote">
                      Quote this <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="carousel-pagination">
          {filteredProducts.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot ${currentIndex === i ? 'active' : ''}`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Continuous Factory Production Marquee Strip */}
        <div className="product-marquee-strip">
          <div className="marquee-header">
            <div className="marquee-label">
              <span className="marquee-dash" />
              <Sparkles size={15} className="marquee-sparkle" />
              <span className="marquee-title">Factory Production Stream</span>
            </div>
            <div className="marquee-controls">
              <span className="marquee-badge"><span className="marquee-live" />{allImages.length} Real Builds</span>
            </div>
          </div>
          <div className="marquee-track-wrapper">
            <div className="marquee-track marquee-row-a">
              {marqueeSlots.map((_, index) => {
                const imageIndex = index % (marqueeSlots.length / 2)
                const buildNum = imageIndex + 1
                return (
                  <button
                    type="button"
                    className="marquee-item"
                    key={index}
                    onClick={() => setPreviewIndex(imageIndex)}
                    title={`Click to preview Build #${buildNum}`}
                    aria-label={`Preview Build #${buildNum}`}
                  >
                    <img src={allImages[imageIndex]} alt={`ZED MEGA Custom Build #${buildNum}`} loading="lazy" decoding="async" />
                    <div className="marquee-item-overlay">
                      <span className="marquee-inspect-pill">
                        <Maximize2 size={12} /> #{buildNum}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="marquee-track marquee-row-b">
              {marqueeSlots.map((_, index) => {
                const imageIndex = (index + 25) % allImages.length
                const buildNum = imageIndex + 1
                return (
                  <button
                    type="button"
                    className="marquee-item"
                    key={index}
                    onClick={() => setPreviewIndex(imageIndex)}
                    title={`Click to preview Build #${buildNum}`}
                    aria-label={`Preview Build #${buildNum}`}
                  >
                    <img src={allImages[imageIndex]} alt={`ZED MEGA Custom Build #${buildNum}`} loading="lazy" decoding="async" />
                    <div className="marquee-item-overlay">
                      <span className="marquee-inspect-pill">
                        <Maximize2 size={12} /> #{buildNum}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Full-Screen High-Res Preview Modal */}
        {previewIndex !== null && (
          <div
            className="build-modal-backdrop"
            onClick={() => setPreviewIndex(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="build-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="build-modal-close"
                onClick={() => setPreviewIndex(null)}
                aria-label="Close preview"
              >
                <X size={18} />
              </button>
              <button
                className="build-modal-nav prev"
                onClick={() => setPreviewIndex((prev) => (prev === null ? null : prev === 0 ? allImages.length - 1 : prev - 1))}
                aria-label="Previous build"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="build-modal-nav next"
                onClick={() => setPreviewIndex((prev) => (prev === null ? null : (prev + 1) % allImages.length))}
                aria-label="Next build"
              >
                <ChevronRight size={20} />
              </button>
              <div className="build-modal-image-wrapper">
                <img
                  src={allImages[previewIndex]}
                  alt={`ZED MEGA Custom Apparel Build #${previewIndex + 1}`}
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    const target = e.target as HTMLImageElement
                    target.src = '/images/products/product-01.webp'
                  }}
                />
              </div>
              <div className="build-modal-body">
                <div className="build-modal-info">
                  <h3>ZED MEGA Production Build #{previewIndex + 1}</h3>
                  <p>Custom teamwear & private-label athletic manufacturing · Sialkot</p>
                </div>
                <a className="button button-red" href="/quote">
                  Quote this build <ArrowRight size={15} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
