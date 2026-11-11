import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { createClub } from './actions'
import '../../components/phase20.css'
export const metadata = { title: 'Clubs et joueurs' }
export default async function ClubsAdmin({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  const open = String(searchParams?.match || '').trim()
  if (/^[\w.-]{1,80}$/.test(open)) redirect(`/dashboard/clubs-joueurs/match/${open}`)
  const q = String(searchParams?.q || '').replace(/[,()%*\\_"]/g, ' ').trim().slice(0, 60)
  let query = sb.from('fc_clubs').select('id,name,country,city,is_published').order('name').limit(200)
  if (q) query = query.ilike('name', `%${q}%`)
  const [{ data: clubs, error }, { data: metas }] = await Promise.all([query, sb.from('fc_matches').select('match_ref,home,away,home_score,away_score,kickoff,updated_at').order('updated_at', { ascending: false }).limit(15)])
  return (<>
    <div className="dash-head"><h1>Clubs et joueurs</h1></div>
    {error && <p className="err" role="alert">Base non à jour : exécutez le fichier supabase/phase20.sql dans Supabase (SQL Editor), puis rechargez cette page.</p>}
    {searchParams?.err && <p className="err" role="alert">Indiquez le nom du club (2 caractères minimum).</p>}
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>Enregistré ✓</p>}
    <section className="panel"><h2>Saisir les détails d’un match</h2>
      <p className="meta">Ouvrez la page du match sur le site : un lien « Saisir ou modifier les détails » apparaît pour la rédaction. Vous pouvez aussi coller ici l’identifiant du match (le dernier morceau de l’adresse /sport/match/…).</p>
      <form method="get" className="f" style={{ margin: 0 }}><label>Identifiant du match<input name="match" placeholder="Ex. 498123" /></label><div><button className="btn sm">Ouvrir</button></div></form>
      {metas?.length > 0 && <><h3 style={{ marginBottom: 4 }}>Derniers matchs documentés</h3>
        {metas.map(m => <p key={m.match_ref} className="qrow"><span><b>{m.home} {m.home_score ?? '-'}-{m.away_score ?? '-'} {m.away}</b></span><Link className="btn sm" href={`/dashboard/clubs-joueurs/match/${m.match_ref}`}>Modifier</Link></p>)}</>}</section>
    <section className="panel"><h2>Nouveau club</h2>
      <form className="f" action={createClub}>
        <label>Nom du club<input name="name" required maxLength={80} placeholder="Ex. TP Mazembe" /></label>
        <label>Pays<input name="country" maxLength={60} placeholder="Ex. RD Congo" /></label>
        <label>Ville<input name="city" maxLength={60} /></label>
        <div><button className="btn">Créer et compléter la fiche</button></div></form></section>
    <section className="panel"><h2>Clubs ({clubs?.length || 0})</h2>
      <form method="get" className="f" style={{ margin: '0 0 8px' }}><label>Rechercher<input name="q" defaultValue={q} placeholder="Nom du club" /></label></form>
      {!clubs?.length && <p className="meta">Aucun club pour le moment. Ils se créent aussi automatiquement quand vous saisissez les détails d’un match.</p>}
      {(clubs || []).map(c => <p key={c.id} className="qrow"><span><b>{c.name}</b><span className="meta">{[c.city, c.country].filter(Boolean).join(', ')}{c.is_published ? '' : ' · masqué'}</span></span><Link className="btn sm" href={`/dashboard/clubs-joueurs/club/${c.id}`}>Gérer</Link></p>)}</section></>)
}
