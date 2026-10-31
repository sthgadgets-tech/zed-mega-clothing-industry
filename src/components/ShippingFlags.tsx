import type { ReactNode } from 'react'
import { Globe2 } from 'lucide-react'

// Simplified circular flags drawn inline so they render the same on every OS
// (Windows has no emoji flags) and need no extra image requests.

const unionJack = <>
  <rect width="60" height="60" fill="#012169" />
  <path d="M0 0L60 60M60 0L0 60" stroke="#fff" strokeWidth="12" />
  <path d="M0 0L60 60M60 0L0 60" stroke="#C8102E" strokeWidth="4" />
  <path d="M30 0V60M0 30H60" stroke="#fff" strokeWidth="18" />
  <path d="M30 0V60M0 30H60" stroke="#C8102E" strokeWidth="10" />
</>

const star = (cx: number, cy: number, r: number) => {
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const radius = i % 2 ? r * 0.45 : r
    return `${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`
  })
  return <polygon key={`${cx}-${cy}`} points={points.join(' ')} fill="#fff" />
}

const vertical = (a: string, b: string, c: string) => <><rect width="20" height="60" fill={a} /><rect x="20" width="20" height="60" fill={b} /><rect x="40" width="20" height="60" fill={c} /></>
const horizontal = (a: string, b: string, c: string) => <><rect width="60" height="20" fill={a} /><rect y="20" width="60" height="20" fill={b} /><rect y="40" width="60" height="20" fill={c} /></>

const flags: { name: string; art: ReactNode }[] = [
  {
    name: 'USA',
    art: <>
      <rect width="60" height="60" fill="#fff" />
      {Array.from({ length: 7 }, (_, i) => <rect key={i} y={i * 120 / 13} width="60" height={60 / 13} fill="#B22234" />)}
      <rect width="30" height="32" fill="#3C3B6E" />
      {Array.from({ length: 20 }, (_, i) => <circle key={i} cx={4 + (i % 5) * 5.5 + (Math.floor(i / 5) % 2) * 2.7} cy={4.5 + Math.floor(i / 5) * 7.5} r="1.3" fill="#fff" />)}
    </>,
  },
  { name: 'UK', art: unionJack },
  {
    name: 'Australia',
    art: <>
      <rect width="60" height="60" fill="#012169" />
      <svg width="30" height="30" viewBox="0 0 60 60">{unionJack}</svg>
      {star(15, 45, 6)}{star(45, 14, 3.4)}{star(52, 27, 3.4)}{star(38, 30, 3.4)}{star(45, 48, 3.4)}
    </>,
  },
  {
    name: 'Canada',
    art: <>
      <rect width="60" height="60" fill="#fff" />
      <rect width="15" height="60" fill="#D80621" /><rect x="45" width="15" height="60" fill="#D80621" />
      <path d="M30 14l3 6 4-2-1 9 5-4 1 3 4-1-2 6 2 1-9 7 1 3h-6v6h-4v-6h-6l1-3-9-7 2-1-2-6 4 1 1-3 5 4-1-9 4 2z" fill="#D80621" />
    </>,
  },
  { name: 'Germany', art: horizontal('#000', '#DD0000', '#FFCE00') },
  { name: 'France', art: vertical('#0055A4', '#fff', '#EF4135') },
  { name: 'Netherlands', art: horizontal('#AE1C28', '#fff', '#21468B') },
  { name: 'Ireland', art: vertical('#169B62', '#fff', '#FF883E') },
]

export function ShippingFlags() {
  return (
    <ul className="ship-flags" aria-label="Countries we ship to">
      {flags.map(({ name, art }) => (
        <li key={name}>
          <span className="ship-flag">
            <svg viewBox="0 0 60 60" aria-hidden="true"><clipPath id={`flag-${name}`}><circle cx="30" cy="30" r="30" /></clipPath><g clipPath={`url(#flag-${name})`}>{art}</g></svg>
          </span>
          <span className="ship-flag-name">{name}</span>
        </li>
      ))}
      <li>
        <span className="ship-flag ship-flag-world"><Globe2 size={34} strokeWidth={1.4} /></span>
        <span className="ship-flag-name">+ Worldwide</span>
      </li>
    </ul>
  )
}
