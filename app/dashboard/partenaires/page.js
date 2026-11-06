import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import ConfirmButton from '../../components/ConfirmButton'
import ImageUploader from '../../components/ImageUploader'
import { addPartner, deletePartner, setPartnerBanner } from '../actions'

export const metadata = { title: 'Partenaires' }

export default async function Partners({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/dashboard')
  const { data: partners, error } = await sb.from('partners').select('id,name,logo_url,banner_url').order('position').order('id')
  return (<>
    <div className="dash-head"><h1>Partenaires</h1></div>
    {error && <p className="err" role="alert">Base non à jour : exécutez le fichier supabase/phase5.sql dans Supabase (SQL Editor), puis rechargez cette page.</p>}
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>Enregistré ✓</p>}
    <section className="panel"><h2>Ajouter un partenaire</h2>
      <form className="f" action={addPartner}>
        <label>Nom du partenaire<input name="name" required /></label>
        <label>Site web (ouvert au clic sur la bannière et le logo)<input name="link_url" placeholder="https://…" inputMode="url" /></label>
        <label>Logo, affiché en bas du site (JPG, PNG ou WebP, 4 Mo maximum)<input type="file" name="logo" accept="image/jpeg,image/png,image/webp" /></label>
        <div><span className="meta">Bannière affichée en slideshow au-dessus des articles. Format conseillé : 960 × 300 px.</span>
          <ImageUploader name="banner_url" folder="articles" label="Choisir la bannière" /></div>
        <div><button className="btn">Ajouter</button></div>
      </form></section>
    <section className="panel"><h2>Partenaires affichés ({partners?.length || 0})</h2>
      {!partners?.length && <p className="meta">Aucun partenaire pour le moment.</p>}
      {(partners || []).map(p => (
        <div key={p.id} className="qrow" style={{ flexWrap: 'wrap' }}>
          <div><b>{p.name}</b><span className="meta">{p.logo_url ? 'Logo' : 'Sans logo'} · {p.banner_url ? 'Bannière en place' : 'Sans bannière'}</span></div>
          <form action={deletePartner}><input type="hidden" name="id" value={p.id} />
            <ConfirmButton message={`Retirer ${p.name} du site ?`}>Supprimer</ConfirmButton></form>
          <form action={setPartnerBanner} style={{ flexBasis: '100%', display: 'grid', gap: 8 }}>
            <input type="hidden" name="id" value={p.id} />
            <ImageUploader name="banner_url" value={p.banner_url || ''} folder="articles" label="Ajouter la bannière (960 × 300 px)" />
            <div><button className="btn sm">Enregistrer la bannière</button></div>
          </form>
        </div>))}
    </section>
  </>)
}
