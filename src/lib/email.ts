export const CONTACT_EMAIL = 'zhr.zedmega@gmail.com'

const SUBJECT = 'Custom Apparel Inquiry – ZED MEGA'
const BODY = `Hi ZED MEGA team,

I would like to discuss a custom apparel order. Here are my details:

Name:
Company / Brand:
Country:
WhatsApp / Phone:

Product type (e.g. hoodies, team uniforms, tracksuits):
Estimated quantity:
Fabric / colour preferences:
Decoration (print, embroidery, labels):
Required delivery date:

I have attached my design / reference images.

Thank you,
`

// Opens the visitor's email app with the inquiry template pre-filled.
export const inquiryMailto = (subject = SUBJECT) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(BODY)}`
