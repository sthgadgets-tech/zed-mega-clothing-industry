import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import './hero-carousel.css'

export interface HeroSlide {
  id: string
  subtitle: string
  title: string
  titleHighlight: string
  description: string
  background: string
}

const heroSlides: HeroSlide[] = [
  {
    id: 'hero-1',
    subtitle: 'Custom sportswear manufacturing / Sialkot, Pakistan',
    title: 'Built for',
    titleHighlight: 'performance.',
    description: 'Custom sportswear and private-label apparel engineered around your designs, your team, and your brand.',
    background: 'linear-gradient(180deg, rgba(6,19,43,.94) 0%, rgba(6,19,43,.72) 43%, rgba(6,19,43,.38) 100%), url("/images/texture-blue.jpg")',
  },
  {
    id: 'hero-2',
    subtitle: 'Premium quality factory / Sialkot, Pakistan',
    title: 'Made for',
    titleHighlight: 'your brand.',
    description: 'Professional manufacturing with precision, quality control, and worldwide delivery for teams and brands.',
    background: 'linear-gradient(180deg, rgba(6,19,43,.94) 0%, rgba(6,19,43,.72) 43%, rgba(6,19,43,.38) 100%), url("/images/texture-blue.jpg")',
  },
  {
    id: 'hero-3',
    subtitle: 'Custom apparel solutions / Sialkot, Pakistan',
    title: 'Engineered',
    titleHighlight: 'for teams.',
    description: 'From concept to production, we create custom sportswear that represents your identity and performance.',
    background: 'linear-gradient(180deg, rgba(6,19,43,.94) 0%, rgba(6,19,43,.72) 43%, rgba(6,19,43,.38) 100%), url("/images/texture-blue.jpg")',
  },
]

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-play timer
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroSlides.length)
  }

  return (
    <section
      className="hero-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="hero-carousel-texture" />

      <div className="container hero-carousel-content">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-slide ${index === currentIndex ? 'active' : ''}`}
            style={{
              backgroundImage: slide.background,
            }}
          >
            <p className="section-label section-label-light">
              <span />
              {slide.subtitle}
            </p>
            <h1>
              {slide.title} <em>{slide.titleHighlight}</em>
            </h1>
            <p>{slide.description}</p>
            <div className="hero-actions">
              <a className="button button-red" href="/quote">
                Get a free quote <ArrowRight size={17} />
              </a>
              <a className="button button-outline" href="#showcase">
                Explore Creations
              </a>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          className="hero-nav-btn hero-nav-prev"
          onClick={handlePrev}
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          className="hero-nav-btn hero-nav-next"
          onClick={handleNext}
          aria-label="Next slide"
        >
          ›
        </button>

        {/* Pagination Dots */}
        <div className="hero-pagination">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${currentIndex === i ? 'active' : ''}`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="hero-side-label">ZED MEGA / 2015—2026</div>
      <div className="hero-scroll">Scroll to explore <span /></div>
    </section>
  )
}
