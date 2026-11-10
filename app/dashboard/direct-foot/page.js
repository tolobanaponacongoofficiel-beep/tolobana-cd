import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { fmtKin } from '@/lib/dates'
import { addStream, toggleStream, deleteStream, addGuide, deleteGuide } from './actions'
export const metadata = { title: 'Direct Foot' }
const ERR = { 1: 'Donnez un titre à la diffusion.', 2: 'Lien refusé : collez un lien https YouTube, Facebook, Vimeo ou un fichier MP4/WebM.', 3: 'Renseignez le match, la date et heure, et les chaînes.', 4: 'Enregistrement impossible : exécutez supabase/phase18.sql.' }
export default async function DirectFootAdmin({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  const [st, gd] = await Promise.all([
    sb.from('foot_streams').select('id,title,embed_url,is_active').order('created_at', { ascending: false }).limit(50),
    sb.from('foot_guide').select('id,match_label,kickoff,channels').order('kickoff', { ascending: false }).limit(50)])
  const err = ERR[searchParams?.err]
  return (<>
    <div className="dash-head"><h1>Direct Foot</h1></div>
    {err && <p className="err" role="alert">{err}</p>}
    {searchParams?.ok && <p className="ok" role="status">Enregistré.</p>}
    {(st.error || gd.error) && <p className="err" role="alert">Base non à jour : exécutez supabase/phase18.sql.</p>}
    <p className="meta">Collez uniquement des liens que vous avez le droit de diffuser : directs officiels de la CAF, des fédérations, des clubs ou de diffuseurs partenaires. Les flux pirates exposent le site à un blocage et à des poursuites.</p>
    <section className="panel"><h2>Ajouter une diffusion vidéo</h2>
      <form className="f" action={addStream}>
        <label>Titre<input name="title" required maxLength={80} placeholder="Ex. : Léopards, match amical" /></label>
        <label>Lien du direct (https)<input name="embed_url" required maxLength={500} placeholder="https://www.youtube.com/watch?v=…" /></label>
        <label>Note (facultatif)<input name="note" maxLength={200} /></label>
        <div><button className="btn">Ajouter</button></div></form>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>{(st.data || []).map(s => <li key={s.id} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <b>{s.title}</b><span className="meta">{s.is_active ? 'Visible' : 'Masquée'}</span>
        <form action={toggleStream}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="on" value={s.is_active ? '0' : '1'} /><button className="btn ghost">{s.is_active ? 'Masquer' : 'Afficher'}</button></form>
        <form action={deleteStream}><input type="hidden" name="id" value={s.id} /><button className="btn ghost">Supprimer</button></form></li>)}</ul></section>
    <section className="panel"><h2>Où regarder : ajouter un match</h2>
      <form className="f" action={addGuide}>
        <label>Match<input name="match_label" required maxLength={120} placeholder="Real Madrid – FC Barcelone" /></label>
        <label>Compétition<input name="competition" maxLength={80} /></label>
        <label>Date et heure (Kinshasa)<input type="datetime-local" name="kickoff" required /></label>
        <label>Chaînes officielles<input name="channels" required maxLength={200} placeholder="beIN Sports, Canal+ Sport…" /></label>
        <label>Lien du diffuseur (facultatif)<input name="link_url" maxLength={300} placeholder="https://…" /></label>
        <div><button className="btn">Ajouter</button></div></form>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>{(gd.data || []).map(g => <li key={g.id} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <b>{g.match_label}</b><span className="meta">{fmtKin(g.kickoff)} · {g.channels}</span>
        <form action={deleteGuide}><input type="hidden" name="id" value={g.id} /><button className="btn ghost">Supprimer</button></form></li>)}</ul></section></>)
}
