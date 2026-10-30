import { MessageCircle } from 'lucide-react'

const messages = [
  'PREMIUM SPORTSWEAR MANUFACTURER',
  'CUSTOM TEAM UNIFORMS',
  'PRIVATE LABEL APPAREL',
  'BUILT FOR PERFORMANCE',
  'GLOBAL B2B PARTNERSHIPS',
]

// One copy of the track is rendered per half. The CSS animation moves the
// track by exactly -50%, so the second copy lands where the first began.
function Track({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="announcement-track" aria-hidden={hidden || undefined}>
      {messages.map((message) => (
        <span className="announcement-item" key={message}>
          {message}
          <span className="announcement-separator" aria-hidden="true" />
        </span>
      ))}
    </div>
  )
}

export function HeaderAnnouncementBar() {
  return (
    <div className="announcement">
      <div className="announcement-marquee">
        <div className="announcement-run">
          <Track />
          <Track hidden />
        </div>
      </div>
      <a className="announcement-whatsapp" href="https://wa.me/923286250355">
        <MessageCircle size={13} aria-hidden="true" /> WhatsApp: +92 328 625 0355
      </a>
    </div>
  )
}
