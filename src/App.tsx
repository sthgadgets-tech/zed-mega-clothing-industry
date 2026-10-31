import { lazy, Suspense, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, ChevronDown, ChevronRight, Clock, Globe2, Hash, Layers, Mail, MessageCircle, PackageCheck, Palette, Phone, Printer, Scissors, ShieldCheck, Sparkles, Tag, X } from 'lucide-react'
import { cn } from './lib/cn'
import { HeaderAnnouncementBar } from './components/HeaderAnnouncementBar'
import { ProductCarousel, showcaseProducts } from './components/ProductCarousel'
import { WhatsAppButton } from './components/WhatsAppButton'
import { ScrollToTop } from './components/ScrollToTop'
import { SocialLinks } from './components/SocialLinks'
import { ShippingFlags } from './components/ShippingFlags'
import { CONTACT_EMAIL, inquiryMailto } from './lib/email'
import { activewear, sports } from './lib/categories'
import { useCategoryCovers } from './lib/categoryCovers'
import './styles.css'
import './quote.css'

// Admin screens are split into their own chunk so public visitors never download them.
const AdminLayout = lazy(() => import('./admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const AdminLogin = lazy(() => import('./admin/AdminLogin').then((m) => ({ default: m.AdminLogin })))
const RequireAdmin = lazy(() => import('./admin/AdminLogin').then((m) => ({ default: m.RequireAdmin })))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })))
const AdminHomepageEditor = lazy(() => import('./admin/AdminHomepageEditor').then((m) => ({ default: m.AdminHomepageEditor })))
const AdminCategories = lazy(() => import('./admin/AdminCategories').then((m) => ({ default: m.AdminCategories })))
const AdminProducts = lazy(() => import('./admin/AdminProducts').then((m) => ({ default: m.AdminProducts })))
const AdminMedia = lazy(() => import('./admin/AdminMedia').then((m) => ({ default: m.AdminMedia })))
const AdminFaq = lazy(() => import('./admin/AdminFaq').then((m) => ({ default: m.AdminFaq })))
const AdminSettings = lazy(() => import('./admin/AdminSettings').then((m) => ({ default: m.AdminSettings })))

const audiences = [
  ['01', 'Sportswear brands', 'Private-label collections, produced around your fit, identity, and commercial calendar.'],
  ['02', 'Teamwear companies', 'Reliable kit programs for teams that need consistency across every season.'],
  ['03', 'Clubs and leagues', 'Match-day uniforms and training layers that look unified on and off the field.'],
  ['04', 'Schools and universities', 'Flexible size runs and durable apparel for campus communities.'],
  ['05', 'Gyms and studios', 'Premium activewear for members, coaches, and branded retail.'],
  ['06', 'Corporate and events', 'Custom apparel that turns a team moment into something people keep.'],
]
const process = [
  ['01', 'Pattern making', 'Your design is translated into production-ready patterns and graded sizes.', '/images/process/pattern-making.webp'],
  ['02', 'Pre-production sampling', 'We make a physical sample so fit, fabric, and decoration can be approved.', '/images/process/sampling.webp'],
  ['03', 'Material sourcing', 'We match performance fabrics and trims to the intended use and hand feel.', '/images/process/material-sourcing.webp'],
  ['04', 'Cutting and printing', 'Panels are cut accurately, then printed, embroidered, or heat-applied.', '/images/process/cutting.webp'],
  ['05', 'Sewing and quality control', 'Experienced operators assemble and inspect every production run.', '/images/process/sewing.webp'],
  ['06', 'Packaging and shipping', 'Your labels and packing plan are applied before worldwide dispatch.', '/images/process/packaging.webp'],
]
const faqs = [
  ['What is your minimum order quantity?', 'Our standard minimum is 50 pieces per style. Sizes can be mixed within that order.'],
  ['Can I use my own design and labels?', 'Yes. You provide the artwork, labels, packaging requirements, and size chart; we build around them.'],
  ['How long does sampling take?', 'A first sample typically takes around seven days after the design and specifications are confirmed.'],
  ['Which countries do you ship to?', 'We work with buyers globally. Your quote includes the destination, preferred courier, and the shipping terms agreed for the order.'],
]
const categoryImages: Record<string, string> = {
  'American Football': '/images/products/product-10.webp',
  Baseball: '/images/products/product-07.webp',
  Basketball: '/images/products/product-04.webp',
  Soccer: '/images/products/product-11.webp',
  Rugby: '/images/products/product-27.webp',
  'Ice Hockey': '/images/products/product-33.webp',
  Cricket: '/images/products/product-29.webp',
  Cycling: '/images/products/product-35.webp',
  Golf: '/images/products/product-08.webp',
  Tennis: '/images/products/product-34.webp',
  Cheerleading: '/images/products/product-47.webp',
  Hoodies: '/images/products/product-14.webp',
  Jackets: '/images/products/product-17.webp',
  'Sports Bras': '/images/products/product-05.webp',
  Leggings: '/images/products/product-26.webp',
  Sweatshirts: '/images/products/product-22.webp',
  'T-Shirts': '/images/products/product-13.webp',
  Shorts: '/images/products/product-12.webp',
  Joggers: '/images/products/product-17.webp',
  Tracksuits: '/images/products/product-42.webp',
  'Street & Fashion Wear': '/images/products/product-51.webp',
}
// Admin-uploaded covers (see /admin/categories) win over the built-in photos.
function useCoverOf() {
  const uploaded = useCategoryCovers()
  return (name: string) => uploaded[name] ?? categoryImages[name]
}

const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const categoryPath = (name: string) => `/category/${slugify(name)}`

function SectionLabel({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={cn('section-label', light && 'section-label-light')}><span />{children}</p>
}

function Logo({ light = true }: { light?: boolean }) {
  return (
    <Link className={cn('brand', !light && 'brand-dark')} to="/">
      <span className="brand-logo-badge">
        <img className="brand-logo" src="/images/logo-shield.webp" alt="ZED MEGA Crest" width={42} height={42} />
      </span>
      <span className="brand-name">ZED <b>MEGA</b><small>Clothing Industry</small></span>
    </Link>
  )
}

const navLinks = [
  ['/#showcase', 'Showcase'],
  ['/#manufacturing', 'Manufacturing'],
  ['/#about', 'About us'],
  ['/#faq', 'FAQs'],
] as const

function Header() {
  const coverOf = useCoverOf()
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [activeHash, setActiveHash] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight the nav link for the section currently in view.
  useEffect(() => {
    const ids = ['categories', ...navLinks.map(([hash]) => hash.slice(2))]
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActiveHash(`/#${entry.target.id}`) })
    }, { rootMargin: '-45% 0px -50% 0px' })
    ids.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onDown = (event: PointerEvent) => { if (!headerRef.current?.contains(event.target as Node)) setMenu(null) }
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenu(null); setOpen(false) } }
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onDown); window.removeEventListener('keydown', onKey) }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('nav-locked', open)
    return () => document.body.classList.remove('nav-locked')
  }, [open])

  const close = () => { setMenu(null); setOpen(false) }

  return <>
    <HeaderAnnouncementBar />
    <header ref={headerRef} className={cn('site-header', scrolled && 'is-scrolled', open && 'is-open')}>
      <div className="container header-inner">
        <Logo />
        <nav className={cn('desktop-nav', open && 'nav-open')} aria-label="Main">
          <div className="nav-drawer-head"><div onClick={close}><Logo /></div><button type="button" className="nav-drawer-close" onClick={close} aria-label="Close navigation"><X size={22} /></button></div>
          <div className="nav-pill">
            {([['Sportswear', sports], ['Activewear', activewear]] as const).map(([label, items]) => (
              <div className={cn('nav-dropdown', menu === label && 'is-active')} key={label} onMouseEnter={() => window.matchMedia('(hover: hover)').matches && setMenu(label)} onMouseLeave={() => { if (window.matchMedia('(hover: hover)').matches) { setMenu(null); setPreview(null) } }}>
                <button onClick={() => { setMenu(menu === label ? null : label); setPreview(null) }} aria-expanded={menu === label} className={cn(activeHash === '/#categories' && 'is-current')}>{label} <ChevronDown size={14} /></button>
                <AnimatePresence>{menu === label && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: .18 }} className="mega-panel">
                    <div className="mega-list">
                      <div className="mega-head"><strong>{label}</strong><span>{items.length} categories</span></div>
                      <div className="mega-grid">
                        {items.map((item, index) => (
                          <Link to={categoryPath(item)} key={item} onClick={close} onMouseEnter={() => setPreview(item)} onFocus={() => setPreview(item)} className={cn('mega-item', (preview ?? items[0]) === item && 'is-previewed')}>
                            <span className="mega-index">{String(index + 1).padStart(2, '0')}</span>
                            <span className="mega-name">{item}</span>
                            <ArrowRight size={14} className="mega-arrow" />
                          </Link>
                        ))}
                      </div>
                    </div>
                    <Link to={categoryPath(preview ?? items[0])} onClick={close} className="mega-feature">
                      <AnimatePresence mode="wait">
                        <motion.span key={preview ?? items[0]} className="mega-feature-img" style={{ backgroundImage: `url(${coverOf(preview ?? items[0])})` }} initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: .35 }} />
                      </AnimatePresence>
                      <span className="mega-feature-body">
                        <small>Custom {label.toLowerCase()}</small>
                        <strong>{preview ?? items[0]}</strong>
                        <span>Your design · MOQ 50 pieces · 7-day samples</span>
                        <em>View products <ArrowRight size={14} /></em>
                      </span>
                    </Link>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            ))}
            {navLinks.map(([hash, label]) => <a key={hash} href={hash} onClick={close} className={cn(activeHash === hash && 'is-current')}>{label}</a>)}
          </div>
          <div className="nav-actions">
            <a className="nav-icon-btn" href="tel:+923286250355" aria-label="Call +92 328 625 0355" title="Call +92 328 625 0355"><Phone size={16} /></a>
            <a className="nav-cta" href="/quote" onClick={close}>Get a quote <ArrowRight size={15} /></a>
          </div>
          <div className="nav-drawer-foot">
            <a href={inquiryMailto()}><Mail size={15} /> {CONTACT_EMAIL}</a>
            <SocialLinks />
          </div>
        </nav>
        {open && <button type="button" className="nav-backdrop" onClick={close} aria-label="Close navigation" tabIndex={-1} />}
        <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Close navigation' : 'Open navigation'}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  </>
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-texture" />
      <div className="container hero-container">
        <div className="hero-grid">
          <div className="hero-content">
            <SectionLabel light>Custom sportswear manufacturing / Sialkot, Pakistan</SectionLabel>
            <h1>Built for <em>performance.</em><br />Made for your brand.</h1>
            <p>Custom sportswear and private-label apparel engineered around your designs, your team, and your brand.</p>
            <div className="hero-actions">
              <a className="button button-red" href="/quote">Get a free quote <ArrowRight size={17} /></a>
              <a className="button button-outline" href="#showcase">Explore Creations</a>
            </div>
            <div className="trust-row">
              <span><ShieldCheck size={16} /> Made to your design</span>
              <span><PackageCheck size={16} /> MOQ from 50 pieces</span>
              <span><Globe2 size={16} /> Worldwide delivery</span>
            </div>
          </div>

          <div className="hero-collage" aria-hidden="true">
            {[
              ['product-11', 'Soccer kits'],
              ['product-04', 'Basketball'],
              ['product-14', 'Hoodie sets'],
              ['product-45', 'Cheerleading'],
              ['product-42', 'Tracksuits'],
              ['product-29', 'Cricket kits'],
            ].map(([img, label]) => (
              <figure key={img} className="hc-tile">
                <img src={`/images/products/${img}.webp`} alt="" decoding="async" />
                <figcaption>{label}</figcaption>
              </figure>
            ))}
            <span className="hc-badge"><img src="/images/logo-shield.webp" alt="" className="hc-logo" /></span>
          </div>
        </div>
      </div>
      <div className="hero-side-label">ZED MEGA / 2015—2026</div>
      <div className="hero-scroll">Scroll to explore <span /></div>
    </section>
  )
}

function Audience() {
  return (
    <section id="about" className="section audience-section">
      <div className="container">
        <div className="section-heading section-heading-light">
          <div>
            <SectionLabel light>Who we make for</SectionLabel>
            <h2>One factory.<br /><span>Every kind of team.</span></h2>
          </div>
          <p>From first sketch to final shipment, we help brands and buyers turn a clear idea into apparel people want to wear.</p>
        </div>
        <div className="audience-grid">
          <div className="audience-image">
            <img loading="lazy" decoding="async" src="/images/products/product-19.webp" alt="ZED MEGA Custom Apparel Manufacturing" />          </div>
          <div className="audience-cards">
            {audiences.map(([number, title, text]) => (
              <motion.a whileHover={{ x: 5 }} href="/quote" className="audience-card" key={number}>
                <span className="card-number">{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <ChevronRight className="card-arrow" size={18} />
              </motion.a>
            ))}
          </div>
        </div>
        <AboutStory />
      </div>
      <div className="red-accent red-accent-left" />
    </section>
  )
}

const aboutFacts = [
  ['2015', 'Founded in Sialkot'],
  ['500+', 'Brands served'],
  ['50 pcs', 'Minimum per style'],
  ['7 days', 'Sample turnaround'],
]

const aboutPoints = [
  [Scissors, 'Your design, our factory', 'Brands, teamwear companies, clubs, schools and gyms send us a design file or reference image. We handle the patterns, fabric sourcing, printing or embroidery, sewing, checking and packing. We don’t sell from stock, sell designs of our own, or offer a design service.'],
  [ShieldCheck, 'Your design stays yours', 'We never sell or reuse your design, and we’ll sign an NDA if you ask.'],
  [PackageCheck, 'Sample first, then bulk', 'Every order starts with a sample, made in about 7 days and shipped to you. Samples are charged separately, and bulk production starts only after you approve yours. Mix sizes within the 50-piece minimum at no extra cost.'],
  [Clock, 'Clear timelines', 'Production takes 10 to 12 business days after your deposit clears. Shipping takes 8 to 10 days by DHL, FedEx or UPS.'],
  [Tag, 'True private label', 'Your brand goes on the neck labels, hang tags, care labels and packaging. Ours doesn’t appear anywhere on the product.'],
] as const

function AboutStory() {
  return (
    <div className="about-story">
      <div className="about-intro">
        <SectionLabel light>About us</SectionLabel>
        <h2>Made in Sialkot.<br /><span>Made to your design.</span></h2>
        <p><strong>ZED MEGA Clothing Industry</strong> is a custom sportswear and activewear manufacturer in Sialkot, Pakistan. We make team uniforms, sportswear and activewear to the buyer’s own design, from 50 pieces per style.</p>
        <p>We started in 2015 and are a member of the Sialkot Chamber of Commerce and Industry. Sialkot has been making sports goods for export for generations, and we’re proud to be part of that.</p>
        <div className="about-facts">
          {aboutFacts.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
        </div>
      </div>
      <div className="about-points">
        {aboutPoints.map(([Icon, title, text]) => (
          <div className="about-point" key={title}>
            <span className="about-point-icon"><Icon size={20} /></span>
            <div><h3>{title}</h3><p>{text}</p></div>
          </div>
        ))}
      </div>
      <div className="about-cta">
        <p>We’ve made orders for more than 500 brands. <strong>Send your design to start yours.</strong></p>
        <div className="about-cta-links">
          <a className="button button-red" href="https://wa.me/923286250355" target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp +92 328 625 0355</a>
          <a className="button button-outline" href={inquiryMailto()}><Mail size={17} /> {CONTACT_EMAIL}</a>
        </div>
        <div className="about-socials">
          <a href="https://www.instagram.com/zed_mega" target="_blank" rel="noreferrer">Instagram store · @zed_mega</a>
          <a href="https://www.facebook.com/share/1JAgRb88Pg/" target="_blank" rel="noreferrer">Facebook store · zed_mega</a>
        </div>
      </div>
    </div>
  )
}

function Ordering() {
  const steps = [['01', 'Share your design', 'Send a design file, sketch, or reference image. We respond with pricing and lead time.'], ['02', 'Approve your sample', 'See and feel a sample made to your specifications before bulk production starts.'], ['03', 'Bulk production', 'Once approved, your order moves into a controlled production schedule.'], ['04', 'Worldwide delivery', 'We pack to your requirements and coordinate the best route to your destination.']]
  return <section className="ordering"><div className="container"><div className="section-heading section-heading-light"><div><SectionLabel light>Simple from start to finish</SectionLabel><h2>How ordering <span>works.</span></h2></div><p>Clear communication at every stage. No guesswork, no stock catalogues, no compromises on your design.</p></div><div className="ordering-grid">{steps.map(([number, title, text]) => <div className="ordering-step" key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{text}</p></div>)}</div><div className="ordering-actions"><a className="button button-red" href="/quote">Start a conversation <ArrowRight size={17} /></a><a href="#manufacturing" className="text-link text-link-light">See our process <ArrowRight size={16} /></a></div></div><div className="red-accent" /></section>
}

const specCapabilities = [
  {
    icon: Palette,
    title: 'Design & Colours',
    badge: 'Pantone Matched',
    desc: 'Your artwork, vector graphics, colour palette, and references stay strictly yours. Exact digital Pantone color matching.',
  },
  {
    icon: Layers,
    title: 'Fabrics & Materials',
    badge: 'Technical Knits',
    desc: 'Performance dry-fit knits, heavyweight fleece, breathable mesh, poly-spandex blends, and custom mill sourcing.',
  },
  {
    icon: Printer,
    title: 'Printing & Decoration',
    badge: 'Multi-Technique',
    desc: 'All-over sublimation, high-density screen print, 3D embroidery, silicone heat transfers, and chenille badges.',
  },
  {
    icon: Hash,
    title: 'Names & Numbers',
    badge: 'Roster Customization',
    desc: 'Individual player personalization, custom varsity fonts, and mixed size runs across your entire squad order.',
  },
  {
    icon: Scissors,
    title: 'Sizes & Pattern Grading',
    badge: 'Precision Fit',
    desc: 'Work from your proprietary size chart or our athletic-fit master blocks, professionally graded across all sizes.',
  },
  {
    icon: Tag,
    title: 'Private Labels & Packaging',
    badge: 'Retail Ready',
    desc: 'Woven neck labels, hang tags, barcode care labels, and individual branded poly bags ready for commercial retail.',
  },
  {
    icon: PackageCheck,
    title: 'Low Minimum Order Quantity',
    badge: '50 Pcs / Style',
    desc: 'Accessible factory MOQ starting from 50 pieces per style, with mixed sizes (XS to 3XL) at no extra setup charge.',
  },
]

function Specification() {
  return (
    <section id="customization" className="section specification">
      <div className="container spec-grid">
        <div className="spec-intro">
          <SectionLabel light>Tailored Apparel Engineering</SectionLabel>
          <h2>You decide<br /><span>every detail.</span></h2>
          <p>The garment should feel like your brand from the first touch. We work from your tech pack or ideas and engineer every seam, fabric weight, and finish to your exact specifications.</p>

          <div className="spec-guarantee-card">
            <div className="sgc-header">
              <ShieldCheck size={18} />
              <span>Factory Direct Guarantee</span>
            </div>
            <ul className="sgc-list">
              <li>100% brand ownership of artwork & patterns</li>
              <li>Pre-production physical sample review</li>
              <li>Commercial quality control at every stage</li>
            </ul>
          </div>

          <div className="spec-actions">
            <a className="button button-red" href="/quote">
              Discuss your brief <ArrowRight size={17} />
            </a>
          </div>
        </div>

        <div className="spec-cards-container">
          <div className="spec-cards-header">
            <span>Factory Capabilities</span>
            <span>What it means for your collection</span>
          </div>
          <div className="spec-cards-list">
            {specCapabilities.map((item) => {
              const Icon = item.icon
              return (
                <div className="spec-card" key={item.title}>
                  <div className="spec-card-icon">
                    <Icon size={20} />
                  </div>
                  <div className="spec-card-body">
                    <div className="spec-card-title-row">
                      <h3>{item.title}</h3>
                      <span className="spec-card-badge">{item.badge}</span>
                    </div>
                    <p>{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="red-accent red-accent-left" />
    </section>
  )
}

const trustPoints = [
  ['50', 'Pieces minimum', 'Low MOQ per style with mixed sizes, so new labels can start small.'],
  ['7', 'Day sampling', 'A physical sample to approve fit, fabric and print before bulk production.'],
  ['100%', 'Inspected', 'Every production run is checked by our QC team before it is packed.'],
  ['Global', 'Shipping', 'Packed with your labels and dispatched worldwide on agreed terms.'],
]

function Testimonials() {
  return (
    <section className="section testimonials">
      <div className="container">
        <div className="trust-head">
          <div>
            <SectionLabel light>Why buyers trust us</SectionLabel>
            <h2>Built on<br /><span>trust.</span></h2>
          </div>
          <p>Every order runs on the same written commitments, so you know what you are getting before the first stitch.</p>
        </div>
        <div className="trust-grid">
          {trustPoints.map(([stat, title, text]) => (
            <article className="trust-card" key={title}>
              <span className="trust-stat">{stat}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="trust-cta">
          <p><strong>Want references?</strong> We can connect you with existing buyers on request.</p>
          <Link className="trust-cta-link" to="/quote">Request a quote <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  )
}

function CategoryCard({ name }: { name: string }) {
  const coverOf = useCoverOf()
  return (
    <Link
      className="category-card"
      to={categoryPath(name)}
      style={{ backgroundImage: `linear-gradient(180deg, rgba(6,19,43,.15), rgba(6,19,43,.92)), url(${coverOf(name)})` }}
    >
      <span>{name}</span>
      <ArrowRight size={17} />
    </Link>
  )
}

function Categories() {
  return (
    <section id="categories" className="section categories">
      <div className="container">
        <div className="section-heading section-heading-light">
          <div>
            <SectionLabel light>Product categories</SectionLabel>
            <h2>Made to move.<br /><span>Made to last.</span></h2>
          </div>
          <p>Browse the product families we manufacture for sports brands, teams, and private-label collections.</p>
        </div>
        <div className="category-block">
          <div className="category-block-title">
            <h3>Sportswear</h3>
            <span>{String(sports.length).padStart(2, '0')} categories</span>
          </div>
          <div className="category-grid">
            {sports.map((name) => <CategoryCard name={name} key={name} />)}
          </div>
        </div>
        <div className="category-block activewear-block">
          <div className="category-block-title">
            <h3>Activewear</h3>
            <span>{String(activewear.length).padStart(2, '0')} categories</span>
          </div>
          <div className="category-grid">
            {activewear.map((name) => <CategoryCard name={name} key={name} />)}
          </div>
        </div>
      </div>
      <div className="red-accent red-accent-left" />
    </section>
  )
}

type CatalogItem = { id: string; title: string; image: string; description: string; moq: string }

function CategoryPage() {
  const coverOf = useCoverOf()
  const { slug } = useParams()
  const { pathname } = useLocation()
  // Old links to /category/streetwear still work after the rename.
  const legacySlugs: Record<string, string> = { streetwear: 'street-fashion-wear' }
  const name = [...sports, ...activewear].find((item) => slugify(item) === (legacySlugs[slug ?? ''] ?? slug))

  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  const [uploaded, setUploaded] = useState<CatalogItem[]>([])

  // Photos added from the admin panel (/admin/products) show before the built-in designs.
  useEffect(() => {
    setUploaded([])
    if (!name) return
    let active = true
    fetch(`/api/products?category=${encodeURIComponent(name)}`)
      .then((response) => response.ok ? response.json() : { products: [] })
      .then((data: { products?: CatalogItem[] }) => { if (active) setUploaded(data.products ?? []) })
      .catch(() => {})
    return () => { active = false }
  }, [name])

  if (!name) {
    return <><Header /><main className="catalog-page"><div className="container catalog-empty"><h1>Category not found</h1><a className="button button-red" href="/#categories">Browse categories <ArrowRight size={17} /></a></div></main><Footer /></>
  }

  const group = sports.includes(name) ? 'Sportswear' : 'Activewear'
  const listed: CatalogItem[] = [...uploaded, ...showcaseProducts.filter((product) => product.category === name)]
  // Categories without showcase items yet still get one card built from their cover image.
  const products = listed.length ? listed : [{ id: slugify(name), title: `Custom ${name}`, image: coverOf(name), description: `${name} made to your design, fabric, and branding.`, moq: 'MOQ 50 PCS' }]
  const quoteHref = `/quote?product=${encodeURIComponent(name)}`

  return <>
    <Header />
    <main className="catalog-page">
      <section className="catalog-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(6,19,43,.96) 30%, rgba(6,19,43,.55)), url(${coverOf(name)})` }}>
        <div className="container">
          <p className="catalog-crumbs"><Link to="/">Home</Link><ChevronRight size={13} /><a href="/#categories">{group}</a><ChevronRight size={13} /><span>{name}</span></p>
          <h1>{name}</h1>
          <p>Custom {name.toLowerCase()} manufactured in Sialkot to your design. MOQ 50 pieces, samples in about 7 days.</p>
        </div>
      </section>

      <div className="container catalog-layout">
        <aside className="catalog-sidebar" aria-label="Categories">
          {([['Sportswear', sports], ['Activewear', activewear]] as const).map(([label, items]) => (
            <div className="catalog-group" key={label}>
              <h2>{label}</h2>
              <nav>
                {items.map((item) => (
                  <Link key={item} to={categoryPath(item)} className={cn(item === name && 'is-active')} aria-current={item === name ? 'page' : undefined}>
                    <img src={coverOf(item)} alt="" loading="lazy" decoding="async" /><span><b>{item}</b><small>{showcaseProducts.filter((p) => p.category === item).length || 1} designs</small></span><ChevronRight size={15} />
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </aside>

        <section className="catalog-main">
          <div className="catalog-toolbar">
            <span>{String(products.length).padStart(2, '0')} {products.length === 1 ? 'design' : 'designs'}</span>
            <Link className="text-link" to={quoteHref}>Request a quote <ArrowRight size={15} /></Link>
          </div>
          <div className="catalog-grid">
            {products.map((product) => (
              <article className="catalog-card" key={product.id}>
                <div className="catalog-card-img"><img src={product.image} alt={product.title} loading="lazy" decoding="async" /><span>{product.moq}</span></div>
                <div className="catalog-card-body">
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                  <div className="catalog-card-actions">
                    <Link className="button button-red" to={quoteHref}>Get a quote <ArrowRight size={15} /></Link>
                    <a className="catalog-wa" href={`https://wa.me/923286250355?text=${encodeURIComponent(`Hi ZED MEGA, I'm interested in: ${product.title}`)}`} target="_blank" rel="noreferrer" aria-label={`Ask about ${product.title} on WhatsApp`}><MessageCircle size={17} /></a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
    <Footer />
  </>
}

function Manufacturing() {
  return (
    <section id="manufacturing" className="section manufacturing">
      <div className="container">
        <div className="section-heading section-heading-light">
          <div>
            <SectionLabel light>From pattern to pack</SectionLabel>
            <h2>How we build<br /><span>your apparel.</span></h2>
          </div>
          <p>Our process keeps quality visible. Every stage has an owner, a check, and a clear handoff.</p>
        </div>
        <div className="process-grid">
          {process.map(([number, title, text, photo], i) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: .3 }}
              transition={{ delay: i * .06 }}
              className="process-card"
              key={number}
            >
              <div className="process-orb">
                <span>{number}</span>
                <div className={`process-shape shape-${i + 1} has-photo`} style={{ backgroundImage: `url(${photo})` }} role="img" aria-label={title} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="red-accent" />
    </section>
  )
}

function Shipping() {
  return (
    <section className="shipping">
      <div className="container shipping-inner">
        <div>
          <SectionLabel light>Across borders, on schedule</SectionLabel>
          <h2>We ship<br /><span>worldwide.</span></h2>
        </div>
        <div className="shipping-copy">
          <Globe2 size={43} strokeWidth={1.2} />
          <p>Your quote is built around your destination, your preferred courier, and the shipping terms that make sense for your business.</p>
          <div className="carrier-row">
            <span>DHL</span>
            <span>FedEx</span>
            <span>UPS</span>
            <span>+ your choice</span>
          </div>
        </div>
      </div>
      <div className="container"><ShippingFlags /></div>
      <div className="red-accent red-accent-left" />
    </section>
  )
}

function FAQ() {
  const [active, setActive] = useState(0)
  return (
    <section id="faq" className="section faq">
      <div className="container faq-grid">
        <div className="faq-intro">
          <SectionLabel light>Need to know</SectionLabel>
          <h2>Questions,<br /><span>answered.</span></h2>
          <p className="muted">Don't see what you're looking for? Our team can help you scope the right next step.</p>
          <div className="faq-contact">
            <strong>Still have a question?</strong>
            <small>Email us and a ready-made inquiry template opens for you.</small>
            <div className="faq-contact-actions">
              <a className="faq-contact-btn faq-contact-email" href={inquiryMailto()}><Mail size={16} /> Email us</a>
              <a className="faq-contact-btn faq-contact-wa" href="https://wa.me/923286250355" target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> WhatsApp</a>
            </div>
            <span className="faq-contact-address">{CONTACT_EMAIL}</span>
          </div>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer], i) => (
            <div className={cn('faq-item', active === i && 'faq-active')} key={question}>
              <button onClick={() => setActive(active === i ? -1 : i)} aria-expanded={active === i}>
                <span className="faq-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="faq-q">{question}</span>
                <span className="faq-toggle"><ChevronDown size={18} /></span>
              </button>
              <AnimatePresence>
                {active === i && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    {answer}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
      
    </section>
  )
}

function Blog() {
  const posts = [
    ['01', 'Buying custom teamwear: a practical starting brief', 'A clear checklist for teams and brands preparing their first manufacturing conversation.', '/images/products/product-25.webp'],
    ['02', 'Choosing the right fabric for activewear', 'A straightforward look at weight, stretch, breathability, and intended use.', '/images/products/product-14.webp'],
    ['03', 'From artwork to production-ready files', 'The details that help a design move smoothly from screen to sample.', '/images/products/product-08.webp'],
  ]
  return (
    <section className="section blog">
      <div className="container">
        <div className="section-heading section-heading-light">
          <div>
            <SectionLabel light>Field notes</SectionLabel>
            <h2>Ideas for<br /><span>the next kit.</span></h2>
          </div>
          <p>Useful guidance for teams, founders, and buyers making their next apparel decision.</p>
        </div>
        <div className="blog-grid">
          {posts.map(([number, title, text, img]) => (
            <a className="blog-card" href="/quote" key={number}>
              <div
                className="blog-image"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(6,19,43,.2), rgba(6,19,43,.85)), url(${img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <span>{number}</span>
                <ArrowRight size={18} />
              </div>
              <p className="blog-meta">ZED MEGA / JOURNAL</p>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="text-link">Read the note <ArrowRight size={15} /></span>
            </a>
          ))}
        </div>
      </div>
      <div className="red-accent red-accent-left" />
    </section>
  )
}

function QuoteCTA() {
  return (
    <section id="quote" className="quote-cta">
      <div className="container quote-inner">
        <div className="quote-copy">
          <SectionLabel light>Let's make something worth wearing</SectionLabel>
          <h2>Have a design<br /><em>in mind?</em></h2>
          <p>Tell us what you're building. We'll come back with a clear next step.</p>
          <div className="quote-cta-actions">
            <a className="button button-red" href="/quote">Get a free quote <ArrowRight size={17} /></a>
            <a className="button button-outline" href={inquiryMailto()}>Email your brief <Mail size={17} /></a>
          </div>
        </div>
        <div className="hero-badge-card">
          <div className="hbc-top">
            <span className="hbc-pill">
              <Sparkles size={13} />
              <span>Direct Factory Production</span>
            </span>
            <span className="hbc-origin">Sialkot · PK</span>
          </div>
          <h3>Engineered For Athletic Champions</h3>
          <p>From pro sublimation to heavyweight fleece and technical knits, we build apparel to your commercial specs.</p>
          <div className="hbc-stats">
            <div className="hbc-stat">
              <strong>50 PCS</strong>
              <span>Low Minimum Order</span>
            </div>
            <div className="hbc-stat">
              <strong>~7 DAYS</strong>
              <span>Fast Sampling</span>
            </div>
            <div className="hbc-stat">
              <strong>100%</strong>
              <span>Custom Tech Pack</span>
            </div>
            <div className="hbc-stat">
              <strong>GLOBAL</strong>
              <span>Air Express Shipping</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return <><ScrollToTop /><WhatsAppButton /><footer className="site-footer"><div className="container"><div className="footer-top"><div><Logo /><p className="footer-blurb">Custom sportswear and private-label activewear from Sialkot, Pakistan. Made around your design.</p><SocialLinks /></div><div className="footer-links"><div><h4>Products</h4><a href="/#categories">Team uniforms</a><a href="/#categories">Tracksuits</a><a href="/#categories">Hoodies & sweatshirts</a><a href="/#categories">Cheerleading</a><a href="/category/street-fashion-wear">Street &amp; fashion wear</a></div><div><h4>Explore</h4><a href="/#showcase">Showcase</a><a href="/#categories">Sportswear</a><a href="/#categories">Activewear</a><a href="/#manufacturing">Manufacturing</a><a href="/#about">About us</a></div><div><h4>Contact</h4><a href={inquiryMailto()}><Mail size={14} /> zhr.zedmega@gmail.com</a><a href="https://wa.me/923286250355"><Phone size={14} /> +92 328 625 0355</a><span><Globe2 size={14} /> Sharay Da Koat, Jaserwala, Daska, Sialkot, Pakistan</span></div></div></div><div className="footer-bottom"><span>© 2026 ZED MEGA Clothing Industry</span><span>Member, Sialkot Chamber of Commerce</span><span>Since 2015</span></div></div></footer></>
}

function Home() {
  // Arriving from another page via /#section: scroll there once the sections have rendered.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id) return
    const timer = window.setTimeout(() => document.getElementById(decodeURIComponent(id))?.scrollIntoView(), 120)
    return () => window.clearTimeout(timer)
  }, [])
  return <><Header /><main><Hero /><ProductCarousel /><Audience /><Ordering /><Specification /><Testimonials /><Categories /><Manufacturing /><Shipping /><FAQ /><Blog /><QuoteCTA /></main><Footer /></>
}
function QuoteField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className="quote-field"><span>{label}</span>{children}{error && <small className="quote-error" role="alert">{error}</small>}</label>
}

function QuotePage() {
  const [searchParams] = useSearchParams()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [serverError, setServerError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(event.currentTarget)
    const value = (key: string) => String(form.get(key) ?? '').trim()
    const next: Record<string, string> = {}
    if (!value('name')) next.name = 'Enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email'))) next.email = 'Enter a valid email address.'
    const quantity = Number(value('quantity'))
    if (!Number.isInteger(quantity) || quantity < 50) next.quantity = 'The minimum order is 50 pieces per style.'
    if (!value('product')) next.product = 'Choose a product type.'
    if (!value('details')) next.details = 'Describe the garments you need.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setStatus('sending')
    setServerError('')
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: value('name'), company: value('company'), email: value('email'), phone: value('phone'), product: value('product'), quantity, details: value('details') }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error ?? 'We could not send your request.')
      formElement.reset()
      setStatus('sent')
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'We could not send your request.')
      setStatus('error')
    }
  }

  return <>
    <Header />
    <main className="quote-page">
      <div className="container quote-page-inner">
        <div className="quote-intro">
          <SectionLabel light>Direct Factory RFQ</SectionLabel>
          <h1>Tell us what <em>you need.</em></h1>
          <p className="quote-lead">Share your project specifications, tech pack, or reference images. Our engineering team reviews every request and replies with custom pricing and production schedule.</p>

          <div className="quote-features">
            <div className="quote-feature-item">
              <Clock className="qf-icon" size={20} />
              <div>
                <strong>24-Hour Quote Turnaround</strong>
                <span>Detailed pricing breakdown within 1 business day</span>
              </div>
            </div>
            <div className="quote-feature-item">
              <Sparkles className="qf-icon" size={20} />
              <div>
                <strong>7-Day Physical Sampling</strong>
                <span>Inspect fabric, fit, and decoration before bulk run</span>
              </div>
            </div>
            <div className="quote-feature-item">
              <PackageCheck className="qf-icon" size={20} />
              <div>
                <strong>Low 50 Pcs Minimum Order</strong>
                <span>Mixed sizes supported across your style run</span>
              </div>
            </div>
            <div className="quote-feature-item">
              <Globe2 className="qf-icon" size={20} />
              <div>
                <strong>Worldwide Doorstep Express</strong>
                <span>Air courier dispatch via DHL, FedEx, or UPS</span>
              </div>
            </div>
          </div>

          <div className="quote-direct-card">
            <div className="qdc-header">
              <MessageCircle size={17} />
              <span>Have immediate questions or tech packs?</span>
            </div>
            <p>Chat directly with our factory production team on WhatsApp or send us your files via email.</p>
            <div className="qdc-actions">
              <a href="https://wa.me/923286250355" target="_blank" rel="noopener noreferrer" className="qdc-btn qdc-wa">
                <Phone size={14} /> WhatsApp: +92 328 625 0355
              </a>
              <a href={inquiryMailto()} className="qdc-btn qdc-mail">
                <Mail size={14} /> zhr.zedmega@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="quote-form-card">
          <div className="quote-card-header">
            <div className="quote-card-title">
              <h3>Custom Apparel Specification</h3>
              <span className="quote-badge">Direct Factory Quotation</span>
            </div>
            <p>Fill out the parameters below. All quotes are free with zero obligation.</p>
          </div>

          <form className="quote-form" onSubmit={handleSubmit} noValidate>
            <div className="quote-row">
              <QuoteField label="Full name *" error={errors.name}>
                <input name="name" placeholder="e.g. Tariq Vance" autoComplete="name" aria-invalid={!!errors.name} />
              </QuoteField>
              <QuoteField label="Company / Brand">
                <input name="company" placeholder="e.g. Apex Sports Club" autoComplete="organization" />
              </QuoteField>
            </div>
            <div className="quote-row">
              <QuoteField label="Work Email *" error={errors.email}>
                <input name="email" type="email" placeholder="name@domain.com" autoComplete="email" aria-invalid={!!errors.email} />
              </QuoteField>
              <QuoteField label="Phone / WhatsApp">
                <input name="phone" type="tel" placeholder="+1 (555) 000-0000" autoComplete="tel" />
              </QuoteField>
            </div>
            <div className="quote-row">
              <QuoteField label="Product Category *" error={errors.product}>
                <select name="product" defaultValue={[...sports, ...activewear].includes(searchParams.get('product') ?? '') ? searchParams.get('product')! : ''} aria-invalid={!!errors.product}>
                  <option value="" disabled>Select a product category</option>
                  <optgroup label="Team Sportswear">{sports.map((item) => <option key={item}>{item}</option>)}</optgroup>
                  <optgroup label="Custom Activewear">{activewear.map((item) => <option key={item}>{item}</option>)}</optgroup>
                </select>
              </QuoteField>
              <QuoteField label="Estimated Quantity (pcs) *" error={errors.quantity}>
                <input name="quantity" type="number" min={50} step={1} placeholder="Min. 50 pcs" inputMode="numeric" aria-invalid={!!errors.quantity} />
              </QuoteField>
            </div>
            <QuoteField label="Project Specifications & Notes *" error={errors.details}>
              <textarea 
                name="details" 
                rows={5} 
                placeholder="Mention desired fabrics (GSM/composition), custom printing/embroidery details, colors, size breakdown, target delivery date, or any specific requirements..."
                aria-invalid={!!errors.details} 
              />
            </QuoteField>
            
            <div className="quote-submit-area">
              <div className="quote-actions">
                <button className="button button-red quote-submit-btn" type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? (
                    <>
                      <span className="quote-spinner" />
                      <span>Transmitting Brief...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit RFQ for Review</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
                <div className="quote-privacy-note">
                  <ShieldCheck size={15} />
                  <span>Your designs and confidential specs remain strictly protected.</span>
                </div>
              </div>

              {status === 'sent' && (
                <div className="quote-alert quote-alert-success" role="status">
                  <CheckCircle2 size={20} />
                  <div>
                    <strong>RFQ Submitted Successfully!</strong>
                    <p>Thank you for reaching out. We have sent a confirmation email and will review your specifications promptly.</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="quote-alert quote-alert-error" role="alert">
                  <X size={18} />
                  <div>
                    <strong>Unable to send request</strong>
                    <p>{serverError || 'Please verify your information or contact us directly on WhatsApp.'}</p>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      <div className="red-accent" />
    </main>
    <Footer />
  </>
}

export default function App() {
  return <Suspense fallback={null}><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/quote" element={<QuotePage />} />
    <Route path="/category/:slug" element={<CategoryPage />} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
      <Route index element={<AdminDashboard />} />
      <Route path="homepage" element={<AdminHomepageEditor />} />
      <Route path="categories" element={<AdminCategories />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="media" element={<AdminMedia />} />
      <Route path="faq" element={<AdminFaq />} />
      <Route path="settings" element={<AdminSettings />} />
    </Route>
  </Routes></Suspense>
}
