import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { pushReady } from '@/lib/push'
import { fmtKin } from '@/lib/dates'
import { sendAlert, makeKeys } from './actions'
export const metadata = { title: 'Alertes push' }
export const dynamic = 'force-dynamic'
const ERR = { 1: 'Les clés d’alerte ne sont pas configurées (voir ci-dessous).', 2: 'Le titre doit contenir au moins 3 caractères.', 3: 'Le lien doit commencer par / (page du site) ou https://.', 4: 'Lecture des abonnés impossible : exécutez supabase/phase24.sql.' }
export default async function Alertes({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  const [{ count, error }, { data: log }] = await Promise.all([
    sb.from('push_subscriptions').select('id', { count: 'exact', head: true }),
    sb.from('push_log').select('id,title,sent,failed,created_at').order('created_at', { ascending: false }).limit(10)])
  const ready = pushReady()
  return (<>
    <div className="dash-head"><h1>Alertes push</h1></div>
    {ERR[searchParams?.err] && <p className="err" role="alert">{ERR[searchParams.err]}</p>}
    {searchParams?.ok != null && <p className="ok" role="status">Alerte envoyée à {searchParams.ok} appareil(s).</p>}
    {error && <p className="err" role="alert">Base non à jour : exécutez supabase/phase24.sql.</p>}
    <p className="meta">Abonnés actuels : <b>{count ?? 0}</b>. Les lecteurs s’abonnent sur la page <a href="/alertes">/alertes</a>. N’envoyez que de vraies informations urgentes : trop d’alertes poussent à se désabonner.</p>
    {!ready && <section className="panel"><h2>Configuration des clés (une seule fois)</h2>
      <p>1. Cliquez sur « Générer mes clés ». 2. Copiez les deux valeurs dans Vercel (Settings, Environment Variables) sous les noms <code>VAPID_PUBLIC_KEY</code> et <code>VAPID_PRIVATE_KEY</code> (la seconde en type Secret). 3. Redéployez.</p>
      {atLeast(role, 'admin') ? <form action={makeKeys}><button className="btn">Générer mes clés</button></form> : <p className="meta">Seul un administrateur peut générer les clés.</p>}
      {searchParams?.pub && atLeast(role, 'admin') && <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
        <label>VAPID_PUBLIC_KEY<input readOnly value={searchParams.pub} onFocus={e => e.target.select()} /></label>
        <label>VAPID_PRIVATE_KEY (à garder secrète)<input readOnly value={searchParams.priv || ''} onFocus={e => e.target.select()} /></label>
        <p className="meta">Ces valeurs ne sont pas enregistrées : copiez-les maintenant.</p></div>}</section>}
    <section className="panel"><h2>Envoyer une alerte</h2>
      <form className="f" action={sendAlert}>
        <label>Titre (70 caractères)<input name="title" required maxLength={70} placeholder="Ex. : Les Léopards qualifiés" /></label>
        <label>Message (facultatif)<input name="body" maxLength={160} /></label>
        <label>Lien à ouvrir<input name="url" maxLength={300} placeholder="/article/mon-article" defaultValue="/" /></label>
        <div><button className="btn" disabled={!ready}>Envoyer à tous les abonnés</button></div></form></section>
    <section className="panel"><h2>Dernières alertes</h2>
      {log?.length ? <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 6 }}>{log.map(l => <li key={l.id}><b>{l.title}</b> <span className="meta">{fmtKin(l.created_at)} · {l.sent} reçus, {l.failed} échecs</span></li>)}</ul> : <p className="meta">Aucune alerte envoyée.</p>}</section></>)
}
