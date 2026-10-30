import { useState, useEffect, useRef } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Maximize2, Sparkles, X } from 'lucide-react'
import './product-carousel.css'

export interface ShowcaseProduct {
  id: string
  title: string
  category: string
  tag: 'team' | 'active' | 'outer' | 'kit'
  image: string
  description: string
  moq: string
}

const showcaseProducts: ShowcaseProduct[] = [
  {
    id: 'prod-34',
    title: 'Grand Slam Tennis Team Uniform',
    category: 'Tennis',
    tag: 'team',
    image: '/images/products/product-34.webp',
    description: 'Pro stadium polo & shorts with matching women’s athletic court dress and lion crest.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-35',
    title: 'Performance Cycling Collection',
    category: 'Cycling',
    tag: 'kit',
    image: '/images/products/product-35.webp',
    description: 'Complete kit build: aerodynamic zip jerseys, padded bib shorts, caps, and gloves.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-36',
    title: 'Pro Road Cycling Aero Kit',
    category: 'Cycling',
    tag: 'active',
    image: '/images/products/product-36.webp',
    description: 'Custom sublimated road cycling kits with breathable micro-mesh and UV protection.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-38',
    title: 'Classic Court Tennis Dress',
    category: 'Tennis',
    tag: 'active',
    image: '/images/products/product-38.webp',
    description: 'Moisture-wicking athletic court dress and performance skirt for club & tournament play.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-10',
    title: 'American Football Pro Uniform',
    category: 'American Football',
    tag: 'team',
    image: '/images/products/product-10.webp',
    description: 'Black & red sublimated game uniform with custom helmet and pads.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-04',
    title: 'Elite Basketball Kit 24',
    category: 'Basketball',
    tag: 'team',
    image: '/images/products/product-04.webp',
    description: 'Breathable royal blue mesh uniform with team numbering and crest.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-11',
    title: 'Stadium Matchday Soccer Kit',
    category: 'Soccer',
    tag: 'team',
    image: '/images/products/product-11.webp',
    description: 'Performance stretch fabric with moisture-wicking and club badge.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-07',
    title: 'Pro Pinstripe Baseball Uniform',
    category: 'Baseball',
    tag: 'team',
    image: '/images/products/product-07.webp',
    description: 'Durable button-down jersey and reinforced pants for competitive play.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-14',
    title: 'Custom Fleece Hoodie & Short Set',
    category: 'Hoodies',
    tag: 'outer',
    image: '/images/products/product-14.webp',
    description: 'Heavyweight fleece pullover with precision embroidery and matching short.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-17',
    title: 'Varsity Bomber Jacket & Joggers',
    category: 'Jackets',
    tag: 'outer',
    image: '/images/products/product-17.webp',
    description: 'Premium wool/poly blend varsity jacket with large embroidered lion crest.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-05',
    title: 'Women’s Athletic Gym Set',
    category: 'Sports Bras',
    tag: 'active',
    image: '/images/products/product-05.webp',
    description: 'Seamless high-compression sports bra and squat-proof fitness leggings.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-20',
    title: 'Streetball Basketball Uniform',
    category: 'Basketball',
    tag: 'team',
    image: '/images/products/product-20.webp',
    description: 'Bold orange and black geometric panels engineered for high mobility.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-22',
    title: 'Dual Athlete Gym Training Wear',
    category: 'Sweatshirts',
    tag: 'active',
    image: '/images/products/product-22.webp',
    description: 'Matching honeycomb activewear tank and shorts set for men and women.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-25',
    title: 'Full Custom Teamwear Package',
    category: 'Custom Kits',
    tag: 'kit',
    image: '/images/products/product-25.webp',
    description: 'Turnkey kit program: jerseys, court shorts, branded socks, and accessories.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-29',
    title: 'Custom Cricket Match Kit',
    category: 'Cricket',
    tag: 'team',
    image: '/images/products/product-29.webp',
    description: 'Lightweight breathable whites and coloured tournament cricket kits.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-16',
    title: 'Gridiron Game Jersey & Pants',
    category: 'American Football',
    tag: 'team',
    image: '/images/products/product-16.webp',
    description: 'Tough four-way stretch fabric with reinforced seams and player numbers.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-21',
    title: 'Pro Aerodynamic Cycling Kit',
    category: 'Cycling',
    tag: 'active',
    image: '/images/products/product-21.webp',
    description: 'Ergonomic aerodynamic speedsuit with full zipper and back pockets.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-08',
    title: 'Bespoke Sports Bags & Accessories',
    category: 'Accessories',
    tag: 'kit',
    image: '/images/products/product-08.webp',
    description: 'Complete branded accessories: heavy duffel bags, caps, and gloves.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-03',
    title: 'Athletics & Sprinter Speedsuit',
    category: 'Running',
    tag: 'active',
    image: '/images/products/product-03.webp',
    description: 'Sublimated compression speedsuit tailored for track and field performance.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-09',
    title: 'Youth & Adult Baseball Uniform',
    category: 'Baseball',
    tag: 'team',
    image: '/images/products/product-09.webp',
    description: 'Vibrant orange trim baseball jersey and tailored athletic pants.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-40',
    title: 'Varsity Patch Wide-Leg Trousers',
    category: 'Streetwear',
    tag: 'active',
    image: '/images/products/product-40.webp',
    description: 'Relaxed wide-leg trousers with varsity chenille-style patches and custom lettering.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-41',
    title: 'Embroidered Fleece Hoodie Set',
    category: 'Tracksuits',
    tag: 'outer',
    image: '/images/products/product-41.webp',
    description: 'Heavyweight fleece hoodie and joggers with custom sleeve and leg embroidery.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-42',
    title: 'Retro Panel Windbreaker Tracksuit',
    category: 'Tracksuits',
    tag: 'outer',
    image: '/images/products/product-42.webp',
    description: 'Cut-and-sew panelled zip jacket, wide-leg pants and matching beanie with your logo.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-43',
    title: 'Custom Logo Windbreaker Set',
    category: 'Tracksuits',
    tag: 'outer',
    image: '/images/products/product-43.webp',
    description: 'Cropped hooded windbreaker and parachute pants with oversized custom logo print.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-44',
    title: 'Puff Print Oversized Hoodie Set',
    category: 'Streetwear',
    tag: 'outer',
    image: '/images/products/product-44.webp',
    description: 'Oversized fleece hoodie and wide-leg sweatpants with puff print graphics.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-45',
    title: 'Classic Cheerleading Uniform',
    category: 'Cheerleading',
    tag: 'team',
    image: '/images/products/product-45.webp',
    description: 'Crop shell top and pleated skirt with tackle-twill team lettering and trim.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-46',
    title: 'Varsity Cheer Shell & Skirt',
    category: 'Cheerleading',
    tag: 'team',
    image: '/images/products/product-46.webp',
    description: 'V-neck cheer shell with chevron striping and box-pleated skirt in team colours.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-47',
    title: 'Team ZED MEGA Cheer Uniform Pack',
    category: 'Cheerleading',
    tag: 'kit',
    image: '/images/products/product-47.webp',
    description: 'Sublimated crop top, pleated skirt, bow, socks, poms and shoes — full squad pack.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-48',
    title: 'Varsity Number Crop Top Set',
    category: 'Streetwear',
    tag: 'active',
    image: '/images/products/product-48.webp',
    description: 'Racerback crop top and wide-leg pants with oversized varsity number print.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-49',
    title: 'Flame Graphic Two-Piece Set',
    category: 'Streetwear',
    tag: 'active',
    image: '/images/products/product-49.webp',
    description: 'Halter crop top and wide-leg pants with bold all-over flame graphics.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-50',
    title: 'Camo Jersey Two-Piece Set',
    category: 'Streetwear',
    tag: 'active',
    image: '/images/products/product-50.webp',
    description: 'Sublimated camo crop tee and matching wide-leg pants with custom numbers.',
    moq: 'MOQ 50 PCS',
  },
  {
    id: 'prod-51',
    title: 'Sublimated Streetwear Set Collection',
    category: 'Streetwear',
    tag: 'kit',
    image: '/images/products/product-51.webp',
    description: 'Crop tops and wide-leg pants in six colourways — fully custom all-over prints.',
    moq: 'MOQ 50 PCS',
  },
]

const allImages = Array.from({ length: 51 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0')
  return `/images/products/product-${num}.webp`
}).filter((src) => !src.endsWith('product-39.webp')) // no product-39 image on disk

export function ProductCarousel() {
  const [activeTab, setActiveTab] = useState<'all' | 'team' | 'active' | 'outer' | 'kit'>('all')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
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
              transform: `translateX(-${currentIndex * 280}px)`,
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
