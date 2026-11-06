import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import ConfirmButton from '../../components/ConfirmButton'
import { sendCampaign, deleteSubscriber } from './actions'

export const metadata = { title: 'Newsletter' }
export const maxDuration = 60

const ERR = {
  mail: 'Envoi d’e-mails non configuré : ajoutez RESEND_API_KEY dans Vercel (voir LISEZMOI-phase7.md).',
  sujet: 'Indiquez un objet.', articles: 'Aucun article publié à inclure.', abonnes: 'Aucun abonné confirmé pour le moment.',
  envoi: 'L’envoi s’est interrompu (service d’e-mail). Vérifiez votre clé et votre adresse d’expédition.',
}
const STATUS = { pending: 'en attente', confirmed: 'confirmé', unsubscribed: 'désabonné' }

export default async function Newsletter({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/dashboard')
  const count = async s => (await sb.from('subscribers').select('id', { count: 'exact', head: true }).eq('status', s)).count || 0
  const [nConf, nPend, nUnsub] = await Promise.all([count('confirmed'), count('pending'), count('unsubscribed')])
  const { data: subs, error } = await sb.from('subscribers').select('id,email,status,created_at').order('created_at', { ascending: false }).limit(200)
  const { data: camps } = await sb.from('newsletter_campaigns').select('id,subject,sent_count,sent_at').order('sent_at', { ascending: false }).limit(10)
  const mailOk = !!process.env.RESEND_API_KEY, keyOk = !!process.env.SUPABASE_SECRET_KEY
  return (<>
    <div className="dash-head"><h1>Newsletter</h1></div>
    {error && <p className="err" role="alert">Base non à jour : exécutez le fichier supabase/phase7.sql dans Supabase, puis rechargez.</p>}
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>{searchParams.ok === 'all' ? `Newsletter envoyée à ${searchParams.sent} abonné(s) ✓` : searchParams.ok === 'test' ? 'E-mail de test envoyé à votre adresse ✓' : 'Enregistré ✓'}</p>}
    {searchParams?.err && <p className="err" role="alert">{ERR[searchParams.err] || 'Erreur.'}{searchParams.sent > 0 ? ` (${searchParams.sent} envoyés avant l’interruption)` : ''}</p>}
    <section className="panel"><h2>État du service</h2>
      <p>Inscriptions des lecteurs : <b>{keyOk ? 'actives' : 'désactivées (SUPABASE_SECRET_KEY manquante)'}</b><br />
        Envoi d’e-mails : <b>{mailOk ? 'actif' : 'désactivé (RESEND_API_KEY manquante)'}</b></p>
      <p className="meta">{nConf} abonné(s) confirmé(s) · {nPend} en attente · {nUnsub} désabonné(s)</p>
      <p><a className="btn sm gray" href="/dashboard/newsletter/export">Exporter les abonnés (CSV)</a></p></section>
    <section className="panel"><h2>Envoyer une newsletter</h2>
      <form className="f" action={sendCampaign}>
        <label>Objet de l’e-mail<input name="subject" required maxLength={150} placeholder="L’essentiel de l’actualité du jour" /></label>
        <label>Mot d’introduction (facultatif)<textarea name="intro" rows={3} maxLength={1500} /></label>
        <label>Nombre d’articles inclus (les plus récents)<select name="count" defaultValue="5"><option>3</option><option>5</option><option>8</option></select></label>
        <label><input type="checkbox" name="all" style={{ width: 'auto' }} /> Envoyer à tous les abonnés confirmés (sinon : un test envoyé à mon adresse seulement)</label>
        <div><ConfirmButton message="Envoyer cette newsletter ?">Envoyer</ConfirmButton></div>
      </form></section>
    <section className="panel"><h2>Derniers envois</h2>
      {!camps?.length && <p className="meta">Aucun envoi pour le moment.</p>}
      {(camps || []).map(c => <p key={c.id}><b>{c.subject}</b> <span className="meta">· {c.sent_count} destinataires · {new Date(c.sent_at).toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa', dateStyle: 'medium', timeStyle: 'short' })}</span></p>)}</section>
    <section className="panel"><h2>Abonnés (200 derniers)</h2>
      {!subs?.length && <p className="meta">Aucun abonné pour le moment.</p>}
      {(subs || []).map(s => (
        <form key={s.id} action={deleteSubscriber} className="qrow"><input type="hidden" name="id" value={s.id} />
          <div><b>{s.email}</b><span className="meta">{STATUS[s.status]} · {new Date(s.created_at).toLocaleDateString('fr-FR', { timeZone: 'Africa/Kinshasa' })}</span></div>
          <ConfirmButton message={`Supprimer ${s.email} ?`}>Supprimer</ConfirmButton></form>))}</section>
  </>)
}
