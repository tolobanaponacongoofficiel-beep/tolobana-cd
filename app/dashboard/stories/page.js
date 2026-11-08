import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import ConfirmButton from '../../components/ConfirmButton'
import ImageUploader from '../../components/ImageUploader'
import { StoryFace } from '../../components/StoryCard'
import { createStory, toggleStory, deleteStory } from './actions'
export const metadata = { title: 'Stories' }
export default async function StoriesDash({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'editor')) redirect('/dashboard')
  const { data: list, error } = await sb.from('stories').select('*').order('created_at', { ascending: false }).limit(60)
  return (<>
    <div className="dash-head"><h1>Stories</h1></div>
    {error && <p className="err" role="alert">Base non à jour : exécutez supabase/phase11.sql.</p>}
    {searchParams?.err && <p className="err" role="alert">Indiquez un titre et choisissez une image.</p>}
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>Enregistré ✓</p>}
    <section className="panel"><h2>Nouvelle story</h2>
      <p className="meta">Une carte verticale : une photo, un titre fort et, si vous voulez, deux chiffres clés. Les lecteurs peuvent la partager comme image sur WhatsApp.</p>
      <form className="f" action={createStory}>
        <ImageUploader name="image_url" label="Choisir la photo (de préférence verticale)" />
        <label>Titre (court et fort)<input name="title" required maxLength={140} placeholder="Kabila : la descente aux enfers" /></label>
        <label>Étiquette (ex. Politique, Sport)<input name="kicker" maxLength={40} /></label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label>Chiffre 1<input name="stat1_value" maxLength={20} placeholder="75 %" /></label><label>Légende 1<input name="stat1_label" maxLength={40} placeholder="Meilleur score" /></label>
          <label>Chiffre 2<input name="stat2_value" maxLength={20} placeholder="1 082 742" /></label><label>Légende 2<input name="stat2_label" maxLength={40} placeholder="Candidats" /></label></div>
        <label>Article lié (coller le lien de l’article, facultatif)<input name="article_slug" maxLength={300} placeholder="https://…/article/mon-article" /></label>
        <div><button className="btn">Publier la story</button></div></form></section>
    <section className="panel"><h2>Stories ({list?.length || 0})</h2>
      <div className="stories-grid dash">{(list || []).map(s => (<div key={s.id}>
        <StoryFace s={s} saver={false} />
        <p className="meta">{s.is_published ? 'En ligne' : 'Masquée'}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <form action={toggleStory}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="publish" value={s.is_published ? '0' : '1'} /><button className="btn sm gray">{s.is_published ? 'Masquer' : 'Remettre'}</button></form>
          <form action={deleteStory}><input type="hidden" name="id" value={s.id} /><ConfirmButton message="Supprimer cette story ?">Supprimer</ConfirmButton></form></div></div>))}</div>
      {!list?.length && <p className="meta">Aucune story pour le moment.</p>}</section></>)
}
