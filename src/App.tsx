import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Camera, ChevronDown, ChevronRight, Globe2, Mail, Menu, MessageCircle, PackageCheck, Phone, ShieldCheck, Sparkles, X } from 'lucide-react'
import { cn } from './lib/cn'
import './styles.css'

const sports = ['American Football', 'Baseball', 'Basketball', 'Soccer', 'Rugby', 'Ice Hockey', 'Cricket', 'Cycling', 'Golf', 'Tennis']
const activewear = ['Hoodies', 'Jackets', 'Sports Bras', 'Leggings', 'Sweatshirts', 'T-Shirts', 'Shorts', 'Joggers']
const audiences = [
  ['01', 'Sportswear brands', 'Private-label collections, produced around your fit, identity, and commercial calendar.'],
  ['02', 'Teamwear companies', 'Reliable kit programs for teams that need consistency across every season.'],
  ['03', 'Clubs and leagues', 'Match-day uniforms and training layers that look unified on and off the field.'],
  ['04', 'Schools and universities', 'Flexible size runs and durable apparel for campus communities.'],
  ['05', 'Gyms and studios', 'Premium activewear for members, coaches, and branded retail.'],
  ['06', 'Corporate and events', 'Custom apparel that turns a team moment into something people keep.'],
]
const process = [
  ['01', 'Pattern making', 'Your design is translated into production-ready patterns and graded sizes.'],
  ['02', 'Pre-production sampling', 'We make a physical sample so fit, fabric, and decoration can be approved.'],
  ['03', 'Material sourcing', 'We match performance fabrics and trims to the intended use and hand feel.'],
  ['04', 'Cutting and printing', 'Panels are cut accurately, then printed, embroidered, or heat-applied.'],
  ['05', 'Sewing and quality control', 'Experienced operators assemble and inspect every production run.'],
  ['06', 'Packaging and shipping', 'Your labels and packing plan are applied before worldwide dispatch.'],
]
const faqs = [
  ['What is your minimum order quantity?', 'Our standard minimum is 50 pieces per style. Sizes can be mixed within that order.'],
  ['Can I use my own design and labels?', 'Yes. You provide the artwork, labels, packaging requirements, and size chart; we build around them.'],
  ['How long does sampling take?', 'A first sample typically takes around seven days after the design and specifications are confirmed.'],
  ['Which countries do you ship to?', 'We work with buyers globally. Your quote includes the destination, preferred courier, and the shipping terms agreed for the order.'],
]
const categoryImages: Record<string, string> = {
  'American Football': 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=900&q=85',
  Baseball: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=900&q=85',
  Basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=85',
  Soccer: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9b6e?auto=format&fit=crop&w=900&q=85',
  Rugby: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=85',
  'Ice Hockey': 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=900&q=85',
  Cricket: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=85',
  Cycling: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=85',
  Golf: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=900&q=85',
  Tennis: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=85',
  Hoodies: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85',
  Jackets: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85',
  'Sports Bras': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=85',
  Leggings: 'https://images.unsplash.com/photo-1506629905607-d9b1a0d7a9f4?auto=format&fit=crop&w=900&q=85',
  Sweatshirts: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=900&q=85',
  'T-Shirts': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
  Shorts: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=900&q=85',
  Joggers: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=900&q=85',
}

function SectionLabel({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={cn('section-label', light && 'section-label-light')}><span />{children}</p>
}

function Logo({ light = true }: { light?: boolean }) {
  return <Link className={cn('brand', !light && 'brand-dark')} to="/"><img className="brand-logo" src="/images/zedmega-logo.jpg" alt="ZED MEGA logo" width={48} height={48} /><span>ZED <b>MEGA</b></span></Link>
}

function Header() {
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState<string | null>(null)
  return <>
    <div className="announcement"><span>PRIVATE LABEL / OEM SPORTSWEAR MANUFACTURING</span><span className="announcement-right"><MessageCircle size={13} /> WhatsApp: +92 328 625 0355</span></div>
    <header className="site-header">
      <div className="container header-inner"><Logo />
        <nav className={cn('desktop-nav', open && 'nav-open')}>
          {([['Sportswear', sports], ['Activewear', activewear]] as const).map(([label, items]) => <div className="nav-dropdown" key={label}>
            <button onClick={() => setMenu(menu === label ? null : label)} aria-expanded={menu === label}>{label} <ChevronDown size={14} /></button>
            <AnimatePresence>{menu === label && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="dropdown-panel">{items.slice(0, 6).map((item) => <a href="#categories" key={item} onClick={() => { setMenu(null); setOpen(false) }}>{item}</a>)}<a className="dropdown-all" href="#categories" onClick={() => setOpen(false)}>View all products <ArrowRight size={14} /></a></motion.div>}</AnimatePresence>
          </div>)}
          <a href="#manufacturing" onClick={() => setOpen(false)}>Manufacturing</a><a href="#about" onClick={() => setOpen(false)}>About us</a><a href="#faq" onClick={() => setOpen(false)}>FAQs</a>
          <a className="nav-cta" href="#quote" onClick={() => setOpen(false)}>Get a quote <ArrowRight size={15} /></a>
        </nav>
        <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close navigation' : 'Open navigation'}>{open ? <X /> : <Menu />}</button>
      </div>
    </header>
  </>
}

function Hero() {
  return <section className="hero"><div className="hero-texture" /><div className="container hero-content"><SectionLabel light>Custom sportswear manufacturing / Sialkot, Pakistan</SectionLabel><h1>Built for <em>performance.</em><br />Made for your brand.</h1><p>Custom sportswear and private-label apparel engineered around your designs, your team, and your brand.</p><div className="hero-actions"><a className="button button-red" href="#quote">Get a free quote <ArrowRight size={17} /></a><a className="button button-outline" href="#categories">Explore products</a></div><div className="trust-row"><span><ShieldCheck size={17} /> Made to your design</span><span><PackageCheck size={17} /> MOQ from 50 pieces</span><span><Globe2 size={17} /> Worldwide delivery</span></div></div><div className="hero-side-label">ZED MEGA / 2015—2026</div><div className="hero-scroll">Scroll to explore <span /></div></section>
}

function Audience() {
  return <section id="about" className="section audience-section"><div className="container"><div className="section-heading"><div><SectionLabel>Who we make for</SectionLabel><h2>One factory.<br /><span>Every kind of team.</span></h2></div><p>From first sketch to final shipment, we help brands and buyers turn a clear idea into apparel people want to wear.</p></div><div className="audience-grid"><div className="audience-image"><img src="/images/logo-shield.jpg" alt="ZED MEGA shield logo" /><div className="image-note"><Sparkles size={18} /><span>Designed in partnership<br /><b>with your team</b></span></div></div><div className="audience-cards">{audiences.map(([number, title, text]) => <motion.a whileHover={{ x: 5 }} href="#quote" className="audience-card" key={number}><span className="card-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div><ChevronRight className="card-arrow" size={18} /></motion.a>)}</div></div></div></section>
}

function Ordering() {
  const steps = [['01', 'Share your design', 'Send a design file, sketch, or reference image. We respond with pricing and lead time.'], ['02', 'Approve your sample', 'See and feel a sample made to your specifications before bulk production starts.'], ['03', 'Bulk production', 'Once approved, your order moves into a controlled production schedule.'], ['04', 'Worldwide delivery', 'We pack to your requirements and coordinate the best route to your destination.']]
  return <section className="ordering"><div className="container"><div className="section-heading section-heading-light"><div><SectionLabel light>Simple from start to finish</SectionLabel><h2>How ordering <span>works.</span></h2></div><p>Clear communication at every stage. No guesswork, no stock catalogues, no compromises on your design.</p></div><div className="ordering-grid">{steps.map(([number, title, text]) => <div className="ordering-step" key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{text}</p></div>)}</div><div className="ordering-actions"><a className="button button-red" href="#quote">Start a conversation <ArrowRight size={17} /></a><a href="#manufacturing" className="text-link text-link-light">See our process <ArrowRight size={16} /></a></div></div><div className="red-accent" /></section>
}

function Specification() {
  const rows = [['Design and colours', 'Your artwork, colour palette, and references stay yours.'], ['Fabrics', 'Performance knits, fleece, mesh, cotton blends, and custom sourcing.'], ['Printing and decoration', 'Sublimation, screen print, embroidery, heat transfer, and patches.'], ['Names and numbers', 'Player personalization and mixed size runs within your order.'], ['Sizes', 'Your size chart or our base blocks, graded to the required range.'], ['Private labels and packaging', 'Neck labels, hang tags, care labels, and packaging with your brand.'], ['Minimum order quantity', 'From 50 pieces per style, with sizes mixed at no extra cost.']]
  return <section className="section specification"><div className="container spec-grid"><div className="spec-intro"><SectionLabel>Your specification, your call</SectionLabel><h2>You decide<br /><span>every detail.</span></h2><p>The garment should feel like your brand from the first touch. We work from your brief and help you make informed choices where needed.</p><a className="button button-dark" href="#quote">Discuss your brief <ArrowRight size={17} /></a></div><div className="spec-table"><div className="spec-table-header"><span>Capability</span><span>What it means for you</span></div>{rows.map(([label, detail]) => <div className="spec-row" key={label}><div><span className="red-dot" />{label}</div><p>{detail}</p></div>)}</div></div></section>
}

function Testimonials() {
  return <section className="section testimonials"><div className="container testimonial-grid"><div><SectionLabel>What buyers say</SectionLabel><h2>Built on<br /><span>trust.</span></h2><p className="muted">No published reviews yet. Add buyer reviews here once you have written permission to quote them.</p><div className="rating-placeholder"><span className="rating-stars">★★★★★</span><strong>Rating summary: pending</strong><small>Unpublished demo state</small></div></div><div className="testimonial-placeholder"><span className="quote-mark">“</span><p>Authorized buyer testimonial goes here.</p><div className="placeholder-line" /><small>Unpublished demo content, not a real customer review</small></div></div></section>
}

function CategoryCard({ name }: { name: string }) {
  return <a className="category-card" href="#quote" style={{ backgroundImage: `linear-gradient(180deg, rgba(6,19,43,.06), rgba(6,19,43,.88)), url(${categoryImages[name]})` }}><span>{name}</span><ArrowRight size={17} /></a>
}
function Categories() {
  return <section id="categories" className="section categories"><div className="container"><div className="section-heading"><div><SectionLabel>Product categories</SectionLabel><h2>Made to move.<br /><span>Made to last.</span></h2></div><p>Browse the product families we manufacture for sports brands, teams, and private-label collections.</p></div><div className="category-block"><div className="category-block-title"><h3>Sportswear</h3><span>10 categories</span></div><div className="category-grid">{sports.map((name) => <CategoryCard name={name} key={name} />)}</div></div><div className="category-block activewear-block"><div className="category-block-title"><h3>Activewear</h3><span>08 categories</span></div><div className="category-grid">{activewear.map((name) => <CategoryCard name={name} key={name} />)}</div></div></div></section>
}

function Manufacturing() {
  return <section id="manufacturing" className="section manufacturing"><div className="container"><div className="section-heading"><div><SectionLabel>From pattern to pack</SectionLabel><h2>How we build<br /><span>your apparel.</span></h2></div><p>Our process keeps quality visible. Every stage has an owner, a check, and a clear handoff.</p></div><div className="process-grid">{process.map(([number, title, text], i) => <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} transition={{ delay: i * .06 }} className="process-card" key={number}><div className="process-orb"><span>{number}</span><div className={`process-shape shape-${i + 1}`} /></div><h3>{title}</h3><p>{text}</p></motion.div>)}</div></div></section>
}

function Shipping() {
  return <section className="shipping"><div className="container shipping-inner"><div><SectionLabel light>Across borders, on schedule</SectionLabel><h2>We ship<br /><span>worldwide.</span></h2></div><div className="shipping-copy"><Globe2 size={43} strokeWidth={1.2} /><p>Your quote is built around your destination, your preferred courier, and the shipping terms that make sense for your business.</p><div className="carrier-row"><span>DHL</span><span>FedEx</span><span>UPS</span><span>+ your choice</span></div></div></div></section>
}

function FAQ() {
  const [active, setActive] = useState(0)
  return <section id="faq" className="section faq"><div className="container faq-grid"><div><SectionLabel>Need to know</SectionLabel><h2>Questions,<br /><span>answered.</span></h2><p className="muted">Don't see what you're looking for? Our team can help you scope the right next step.</p><a className="text-link" href="#quote">Ask us directly <ArrowRight size={16} /></a></div><div className="faq-list">{faqs.map(([question, answer], i) => <div className={cn('faq-item', active === i && 'faq-active')} key={question}><button onClick={() => setActive(active === i ? -1 : i)}><span>{question}</span><ChevronDown size={19} /></button><AnimatePresence>{active === i && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>{answer}</motion.p>}</AnimatePresence></div>)}</div></div></section>
}

function Blog() {
  const posts = [
    ['01', 'Buying custom teamwear: a practical starting brief', 'A clear checklist for teams and brands preparing their first manufacturing conversation.'],
    ['02', 'Choosing the right fabric for activewear', 'A straightforward look at weight, stretch, breathability, and intended use.'],
    ['03', 'From artwork to production-ready files', 'The details that help a design move smoothly from screen to sample.'],
  ]
  return <section className="section blog"><div className="container"><div className="section-heading"><div><SectionLabel>Field notes</SectionLabel><h2>Ideas for<br /><span>the next kit.</span></h2></div><p>Useful guidance for teams, founders, and buyers making their next apparel decision.</p></div><div className="blog-grid">{posts.map(([number, title, text]) => <a className="blog-card" href="#quote" key={number}><div className="blog-image"><span>{number}</span><ArrowRight size={18} /></div><p className="blog-meta">ZED MEGA / JOURNAL</p><h3>{title}</h3><p>{text}</p><span className="text-link">Read the note <ArrowRight size={15} /></span></a>)}</div></div></section>
}

function QuoteCTA() {
  return <section id="quote" className="quote-cta"><div className="container quote-inner"><SectionLabel light>Let's make something worth wearing</SectionLabel><h2>Have a design<br /><em>in mind?</em></h2><p>Tell us what you're building. We'll come back with a clear next step.</p><a className="button button-red" href="https://wa.me/923286250355">Get a free quote <ArrowRight size={17} /></a></div></section>
}

function Footer() {
  return <footer className="site-footer"><div className="container"><div className="footer-top"><div><Logo /><p className="footer-blurb">Custom sportswear and private-label activewear from Sialkot, Pakistan. Made around your design.</p><div className="socials"><a href="#quote" aria-label="Instagram"><Camera size={17} /></a><a href="#quote" aria-label="Message us"><MessageCircle size={17} /></a><a href="mailto:zhr.zedmega@gmail.com" aria-label="Email"><Mail size={17} /></a></div></div><div className="footer-links"><div><h4>Explore</h4><a href="#categories">Sportswear</a><a href="#categories">Activewear</a><a href="#manufacturing">Manufacturing</a><a href="#about">About us</a></div><div><h4>Contact</h4><a href="mailto:zhr.zedmega@gmail.com"><Mail size={14} /> zhr.zedmega@gmail.com</a><a href="https://wa.me/923286250355"><Phone size={14} /> +92 328 625 0355</a><span><Globe2 size={14} /> Sharay Da Koat, Jaserwala, Daska, Sialkot, Pakistan</span></div></div></div><div className="footer-bottom"><span>© 2026 ZED MEGA Clothing Industry</span><span>Member, Sialkot Chamber of Commerce</span><span>Since 2015</span></div></div></footer>
}

function Home() { return <><Header /><main><Hero /><Audience /><Ordering /><Specification /><Testimonials /><Categories /><Manufacturing /><Shipping /><FAQ /><Blog /><QuoteCTA /></main><Footer /></> }
export default function App() { return <Home /> }
