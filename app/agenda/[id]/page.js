import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { isUuid, safeUrl } from '@/lib/blocks'
import { CATS, dayTitle, hm } from '@/lib/agenda'
import { SITE_URL } from '@/lib/site'
import '../../components/phase14.css'
export const revalidate = 300
async function load(id) { if (!isUuid(id)) return null; const { data } = await supabaseServer().from('events').select('*').eq('id', id).eq('is_published', true).maybeSingle(); return data }
export async function generateMetadata({ params }) {
  const e = await load(params.id); if (!e) return { title: 'Événement' }
  return { title: `${e.title} : agenda`, description: `${dayTitle(e.starts_at)} à ${hm(e.starts_at)}${e.venue ? `, ${e.venue}` : ''}.`, alternates: { canonical: `/agenda/${e.id}` } }
}
export default async function EventPage({ params }) {
  const e = await load(params.id); if (!e) notFound()
  const url = `${SITE_URL}/agenda/${e.id}`, link = safeUrl(e.link_url)
  const ld = { '@context': 'https://schema.org', '@type': 'Event', name: e.title, startDate: e.starts_at, ...(e.ends_at ? { endDate: e.ends_at } : {}), eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', description: e.description || undefined, image: e.image_url || undefined, url,
    location: { '@type': 'Place', name: e.venue || e.city || 'République démocratique du Congo', address: { '@type': 'PostalAddress', addressLocality: e.city || 'Kinshasa', addressCountry: 'CD' } } }
  const wa = `https://wa.me/?text=${encodeURIComponent(`${e.title} : ${dayTitle(e.starts_at)} à ${hm(e.starts_at)}. ${url}`)}`
  return (<main className="wrap" style={{ maxWidth: 820 }}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
    <p className="meta"><Link href="/agenda">← Agenda</Link></p>
    <span className="chip">{CATS[e.category] || 'Autre'}</span>
    <h1 style={{ margin: '8px 0' }}>{e.title}</h1>
    <ul className="ag-facts">
      <li><b>Quand</b><span className="ag-cap" style={{ display: 'inline-block' }}>{dayTitle(e.starts_at)}</span> à {hm(e.starts_at)}{e.ends_at ? ` (jusqu’à ${hm(e.ends_at)})` : ''} <small>heure de Kinshasa</small></li>
      {(e.venue || e.city) && <li><b>Où</b>{[e.venue, e.city].filter(Boolean).join(', ')}</li>}</ul>
    {e.image_url && <img className="ag-img" src={e.image_url} alt="" />}
    {e.description && <div className="ag-desc">{e.description.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}</div>}
    <div className="share10"><a className="btn" href={`/agenda/${e.id}/ics`}>Ajouter à mon calendrier</a>
      <a className="btn wa" href={wa} target="_blank" rel="noopener noreferrer">Partager sur WhatsApp</a>
      {link && <a className="btn ghost" href={link} target="_blank" rel="noopener noreferrer nofollow">Plus d’informations</a>}</div>
  </main>)
}
