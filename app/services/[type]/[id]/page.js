import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { TYPES, isType } from '@/lib/services'
import { isUuid, isMediaUrl } from '@/lib/blocks'
import { fmtKin } from '@/lib/dates'
import '../../../components/phase12.css'
async function load(type, id) {
  if (!isType(type) || !isUuid(id)) return null
  const now = new Date().toISOString()
  const { data } = await supabaseServer().from('service_posts').select('*').eq('id', id).eq('type', type).eq('status', 'published').or(`expires_at.is.null,expires_at.gt.${now}`).maybeSingle()
  return data
}
export async function generateMetadata({ params }) { const p = await load(params.type, params.id); return p ? { title: p.title, description: p.body.slice(0, 160), alternates: { canonical: `/services/${p.type}/${p.id}` } } : { robots: { index: false } } }
export default async function ServicePost({ params }) {
  const p = await load(params.type, params.id)
  if (!p) notFound()
  const T = TYPES[p.type]
  return (<main className="wrap"><article className="svc-detail">
    <span className="svc-tag">{T.label}</span><h1>{p.title}</h1>
    <p className="meta">{[p.org, p.location].filter(Boolean).join(' · ')}{p.published_at ? ` · publié le ${fmtKin(p.published_at, { dateStyle: 'long' })}` : ''}{p.deadline ? ` · date limite ${fmtKin(`${p.deadline}T12:00:00+01:00`, { dateStyle: 'long' })}` : ''}</p>
    {p.image_url && isMediaUrl(p.image_url) && <img src={p.image_url} alt="" />}
    <div className="body">{p.body}</div>
    <div className="svc-contact"><b>Contact :</b> {p.contact}</div>
    <p className="svc-note">Cette publication est transmise par un tiers et n’engage pas la rédaction. <Link href="/services">Tous les services</Link></p>
  </article></main>)
}
