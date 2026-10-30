import { useEffect, useRef, useState } from 'react'
import { FileText, Rocket, Scissors, Send, Shirt, X } from 'lucide-react'
import './whatsapp-button.css'

const WHATSAPP_NUMBER = '923286250355'
const DEFAULT_MESSAGE = 'Hi ZED MEGA, I want to '
const QUICK_MESSAGES = [
  { label: 'Get a quote', icon: FileText, text: 'Hi ZED MEGA, I want a quote for custom sportswear.' },
  { label: 'Order samples', icon: Scissors, text: 'Hi ZED MEGA, I want to order samples for my brand.' },
  { label: 'Start my brand', icon: Rocket, text: 'Hi ZED MEGA, I want to start my own clothing line.' },
  { label: 'Team uniforms', icon: Shirt, text: 'Hi ZED MEGA, I want team uniforms for my club.' },
]

const whatsappUrl = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text.trim())}`

function WhatsAppIcon({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <path fill="currentColor" d="M16 3C8.83 3 3 8.83 3 16c0 2.29.6 4.53 1.74 6.5L3 29l6.7-1.7A12.94 12.94 0 0 0 16 29c7.17 0 13-5.83 13-13S23.17 3 16 3Zm0 23.6c-2.02 0-4-.55-5.72-1.58l-.41-.24-3.98 1.01 1.06-3.87-.27-.43A10.57 10.57 0 0 1 5.4 16C5.4 10.16 10.16 5.4 16 5.4S26.6 10.16 26.6 16 21.84 26.6 16 26.6Zm5.8-7.93c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.76-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.07 1.3 3.28c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  )
}

export function WhatsAppButton() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const input = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!open) return
    const field = input.current
    field?.focus()
    field?.setSelectionRange(field.value.length, field.value.length)
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const send = (text: string) => {
    window.open(whatsappUrl(text), '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  return (
    <div className={`wa-widget ${open ? 'is-open' : ''}`}>
      <div className="wa-panel" role="dialog" aria-label="Chat with ZED MEGA on WhatsApp" aria-hidden={!open}>
        <header className="wa-panel-head">
          <span className="wa-avatar"><img src="/images/logo-shield.webp" alt="" /><i /></span>
          <div><strong>ZED MEGA</strong><small><span className="wa-online" />Online · Clothing Industry</small></div>
          <button type="button" className="wa-close" onClick={() => setOpen(false)} aria-label="Close chat" tabIndex={open ? 0 : -1}><X size={18} /></button>
        </header>
        <div className="wa-panel-body">
          <div className="wa-bubble">
            <strong>Assalam-o-Alaikum! 👋</strong>
            <p>Tell us what you need and our team will reply on WhatsApp.</p>
          </div>
          <p className="wa-quick-title">Quick start</p>
          <div className="wa-quick">
            {QUICK_MESSAGES.map(({ label, icon: Icon, text }) => <button type="button" key={label} onClick={() => send(text)} tabIndex={open ? 0 : -1}><Icon size={15} />{label}</button>)}
          </div>
        </div>
        <form className="wa-compose" onSubmit={(event) => { event.preventDefault(); send(message) }}>
          <textarea ref={input} rows={1} value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(message) } }} aria-label="Your message" tabIndex={open ? 0 : -1} />
          <button type="submit" aria-label="Send on WhatsApp" disabled={!message.trim()} tabIndex={open ? 0 : -1}><Send size={18} /></button>
        </form>
        <p className="wa-foot"><WhatsAppIcon size={12} /> Opens in WhatsApp · +92 328 625 0355</p>
      </div>

      <button type="button" className="wa-float" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Close WhatsApp chat' : 'Chat with ZED MEGA on WhatsApp'}>
        <span className="wa-pulse" aria-hidden="true" />
        <span className="wa-icon">{open ? <X size={26} /> : <WhatsAppIcon />}</span>
        <span className="wa-badge" aria-hidden="true">1</span>
      </button>
    </div>
  )
}
