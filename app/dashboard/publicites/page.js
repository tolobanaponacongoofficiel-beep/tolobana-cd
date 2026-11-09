import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import ConfirmButton from '../../components/ConfirmButton'
import ImageUploader from '../../components/ImageUploader'
import { fmtKin } from '@/lib/dates'
import { createAd, toggleAd, deleteAd, setAdAmount } from './actions'
export const metadata = { title: 'Publicités' }
const PLACE = { banner: 'Bandeau (haut des pages)', sidebar: 'Colonne de l’accueil', article: 'Dans les articles' }
export default async function Publicites({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/dashboard')
  const { data: ads, error } = await sb.from('ads').select('*').order('created_at', { ascending: false }).limit(100)
  const now = Date.now()
  const state = a => !a.is_active ? 'en pause' : new Date(a.starts_at).getTime() > now ? 'programmée' : a.ends_at && new Date(a.ends_at).getTime() <= now ? 'terminée' : 'en ligne'
  return (<>
    <div className="dash-head"><h1>Publicités</h1></div>
    {error && <p className="err" role="alert">Base non à jour : exécutez supabase/phase10.sql.</p>}
    {!process.env.SUPABASE_SECRET_KEY && <p className="err" role="alert">Sans la variable SUPABASE_SECRET_KEY, les affichages et les clics ne sont pas comptés.</p>}
    {searchParams?.err && <p className="err" role="alert">Indiquez un titre, un emplacement et une image.</p>}
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>Enregistré ✓</p>}
    <section className="panel"><h2>Nouvelle annonce</h2>
      <form className="f" action={createAd}>
        <label>Titre de l’annonce (affiché si l’image ne charge pas)<input name="title" required maxLength={150} /></label>
        <label>Annonceur<input name="advertiser" maxLength={150} /></label>
        <label>Emplacement<select name="placement" defaultValue="sidebar">{Object.entries(PLACE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <div><ImageUploader name="image_url" label="Choisir l’image de l’annonce" /><p className="meta">Bandeau : image large et basse (ex. 970 × 120). Colonne et articles : image plus haute (ex. 300 × 250).</p></div>
        <label>Lien de destination (https://…, facultatif)<input name="link_url" type="url" maxLength={500} /></label>
        <label>Montant facturé (facultatif, ex. 150 USD ou 200 000 FC)<input name="amount_note" maxLength={80} /></label>
        <label>Début (heure de Kinshasa, facultatif)<input type="datetime-local" name="starts_at" /></label>
        <label>Fin (facultative)<input type="datetime-local" name="ends_at" /></label>
        <div><button className="btn">Publier l’annonce</button></div></form></section>
    <section className="panel"><h2>Annonces ({ads?.length || 0})</h2>
      {(ads || []).map(a => { const ctr = a.impressions ? (a.clicks / a.impressions * 100).toFixed(1) : '0.0'; return (
        <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12, marginBottom: 16, alignItems: 'start' }}>
          <img src={a.image_url} alt="" style={{ width: 110, borderRadius: 4 }} />
          <div><b>{a.title}</b> <span className="chip">{state(a)}</span>
            <div className="stat-row">{a.advertiser ? `${a.advertiser} · ` : ''}{PLACE[a.placement]}</div>
            <div className="stat-row">{a.impressions} affichage{a.impressions > 1 ? 's' : ''} · {a.clicks} clic{a.clicks > 1 ? 's' : ''} · taux de clic {ctr} %</div>
            <div className="stat-row">Du {fmtKin(a.starts_at, { dateStyle: 'medium' })}{a.ends_at ? ` au ${fmtKin(a.ends_at, { dateStyle: 'medium' })}` : ' (sans fin)'}</div>
            <form action={setAdAmount} style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}><input type="hidden" name="id" value={a.id} /><input name="amount_note" defaultValue={a.amount_note ?? ''} placeholder="Montant facturé" maxLength={80} style={{ width: 170 }} aria-label="Montant facturé" /><button className="btn sm gray">Enregistrer le montant</button></form>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <form action={toggleAd}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="active" value={a.is_active ? '0' : '1'} /><button className="btn sm gray">{a.is_active ? 'Mettre en pause' : 'Reprendre'}</button></form>
              <form action={deleteAd}><input type="hidden" name="id" value={a.id} /><ConfirmButton message="Supprimer cette annonce ?">Supprimer</ConfirmButton></form></div></div>
        </div>) })}
      {!ads?.length && <p className="meta">Aucune annonce pour le moment.</p>}</section></>)
}
