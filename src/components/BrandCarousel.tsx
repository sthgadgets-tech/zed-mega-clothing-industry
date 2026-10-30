import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import './brand-carousel.css'

export interface BrandItem {
  id: string
  title: string
  category: string
  image: string
  description: string
}

const brandItems: BrandItem[] = [
  {
    id: 'brand-01',
    title: 'ZED MEGA Football Uniform',
    category: 'Football',
    image: '/images/brands/brand-01.jpg',
    description: 'Premium quality football uniform with lion crest logo and custom numbering.',
  },
  {
    id: 'brand-02',
    title: 'ZED MEGA Basketball Kit',
    category: 'Basketball',
    image: '/images/brands/brand-02.jpg',
    description: 'High-performance basketball uniform with moisture-wicking fabric.',
  },
  {
    id: 'brand-03',
    title: 'ZED MEGA Soccer Jersey',
    category: 'Soccer',
    image: '/images/brands/brand-03.jpg',
    description: 'Professional soccer jersey with breathable mesh panels.',
  },
  {
    id: 'brand-04',
    title: 'ZED MEGA Training Gear',
    category: 'Training',
    image: '/images/brands/brand-04.jpg',
    description: 'Complete training set with matching accessories.',
  },
  {
    id: 'brand-05',
    title: 'ZED MEGA Cricket Uniform',
    category: 'Cricket',
    image: '/images/brands/brand-05.jpg',
    description: 'Lightweight cricket uniform for tournament play.',
  },
]

export function BrandCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const itemsCount = brandItems.length

  // Auto-play timer
  useEffect(() => {
    if (isPaused || itemsCount <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % itemsCount)
    }, 4000)
    return () => clearInterval(timer)
  }, [isPaused, itemsCount])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? itemsCount - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % itemsCount)
  }

  return (
    <section className="brand-carousel-section" id="brand">
      <div className="container">
        {/* Header */}
        <div className="brand-carousel-header">
          <div className="brand-header-text">
            <p className="section-label section-label-light">
              <span />
              Our Brand
            </p>
            <h2>
              ZED MEGA <span>Collection.</span>
            </h2>
            <p>
              Premium custom sports apparel manufactured with precision and quality for teams worldwide.
            </p>
          </div>

          <div className="brand-carousel-controls">
            <button
              className="brand-nav-btn"
              onClick={handlePrev}
              aria-label="Previous slide"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              className="brand-nav-btn"
              onClick={handleNext}
              aria-label="Next slide"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        {/* Carousel Viewport */}
        <div
          className="brand-carousel-viewport"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={trackRef}
            className="brand-carousel-track"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {brandItems.map((item) => (
              <div className="brand-slide" key={item.id}>
                <div className="brand-slide-image">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                  />
                  <div className="brand-slide-overlay" />
                </div>
                <div className="brand-slide-content">
                  <span className="brand-category">{item.category}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <a className="brand-slide-link" href="/quote">
                    Get Quote <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="brand-carousel-pagination">
          {brandItems.map((_, i) => (
            <button
              key={i}
              className={`brand-dot ${currentIndex === i ? 'active' : ''}`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
