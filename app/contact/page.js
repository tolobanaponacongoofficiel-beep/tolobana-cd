import InfoPage from '../components/InfoPage'
import ContactForm from '../components/ContactForm'
import { supabaseServer } from '@/lib/supabase/server'
import { getSettings } from '@/lib/settings'
export const metadata = { title: 'Contact', alternates: { canonical: '/contact' } }
export default async function Contact() {
  const s = await getSettings(supabaseServer())
  const wa = (s.whatsapp || '').replace(/\D/g, '')
  return (
    <InfoPage slug="contact">
      <div className="contact-box">
        {s.email && <div>E-mail : <a href={`mailto:${s.email}`}>{s.email}</a></div>}
        {s.phone && <div>Téléphone : <a href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a></div>}
        {wa && <div>WhatsApp : <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">{s.whatsapp}</a></div>}
        {s.address && <div>Adresse : {s.address}</div>}
      </div>
      <h2>Écrire à la rédaction</h2>
      <ContactForm />
    </InfoPage>)
}
