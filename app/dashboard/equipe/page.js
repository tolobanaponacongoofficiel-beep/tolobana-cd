import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Avatar from '../../components/Avatar'
import { changeRole } from './actions'
import '../../components/phase8.css'

export const metadata = { title: 'Équipe et rôles' }
const LABEL = { reader: 'Lecteur', user: 'Lecteur', member: 'Lecteur', journalist: 'Journaliste', editor: 'Éditeur', admin: 'Administrateur', super_admin: 'Super-administrateur' }
const TOP = ['journalist', 'editor', 'admin', 'super_admin']
const ERR = { invalide: 'Changement refusé : compte ou rôle invalide.', refuse: 'La base a refusé le changement. Vérifiez SUPABASE_SECRET_KEY dans Vercel.' }
const lab = r => LABEL[r] || r

export default async function Team({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/dashboard')
  const canEdit = role === 'super_admin'
  const q = String(searchParams?.q || '').trim().toLowerCase().slice(0, 60)
  const showReaders = !!searchParams?.lecteurs

  const { data: profiles } = await sb.from('profiles').select('id,name,role,photo_url').order('name').limit(2000)
  const emails = {}
  const adminDb = supabaseAdmin()
  if (adminDb) {
    const { data } = await adminDb.auth.admin.listUsers({ page: 1, perPage: 1000 })
    for (const u of data?.users || []) emails[u.id] = u.email
  }
  const all = profiles || []
  const reader = all.map(p => p.role).find(r => !TOP.includes(r))
  const staff = all.filter(p => TOP.includes(p.role))
  const list = q ? all.filter(p => `${p.name || ''} ${emails[p.id] || ''}`.toLowerCase().includes(q))
    : showReaders ? all : staff
  const options = [...['journalist', 'editor', 'admin'], ...(reader ? [reader] : [])]

  return (<>
    <div className="dash-head"><h1>Équipe et rôles</h1></div>
    <p className="lead">{canEdit ? 'Choisissez le rôle de chaque personne. Le changement est immédiat.' : 'Seul le super-administrateur peut changer les rôles. Vous pouvez consulter l’équipe.'}</p>
    {searchParams?.ok && <p className="notice ok" role="status">Rôle modifié ✓</p>}
    {ERR[searchParams?.err] && <p className="notice bad" role="alert">{ERR[searchParams.err]}</p>}

    <section className="panel">
      <form className="f" style={{ margin: '0 0 8px', maxWidth: 480 }}>
        <label>Rechercher une personne (nom{adminDb ? ' ou e-mail' : ''})
          <div style={{ display: 'flex', gap: 8 }}><input name="q" defaultValue={q} placeholder="Ex. Marie" /><button className="btn">Chercher</button></div></label>
      </form>
      <p className="meta">{q ? `${list.length} résultat(s)` : showReaders ? `${list.length} compte(s) au total` : `${list.length} membre(s) de l’équipe`} ·{' '}
        {showReaders || q ? <Link href="/dashboard/equipe" style={{ color: 'var(--blue)' }}>Voir seulement l’équipe</Link> : <Link href="/dashboard/equipe?lecteurs=1" style={{ color: 'var(--blue)' }}>Voir aussi les lecteurs inscrits</Link>}</p>

      {!list.length && <p className="meta">Personne ne correspond.</p>}
      {list.map(p => {
        const self = p.id === user.id, locked = p.role === 'super_admin'
        return (
          <div key={p.id} className="member">
            <Avatar name={p.name} url={p.photo_url} />
            <div><b>{p.name || 'Sans nom'}{self ? ' (vous)' : ''}</b><span className="meta">{emails[p.id] || ''}</span></div>
            {canEdit && !self && !locked ? (
              <form action={changeRole}><input type="hidden" name="id" value={p.id} />
                <select name="role" defaultValue={p.role} aria-label={`Rôle de ${p.name || 'cette personne'}`}>
                  {!options.includes(p.role) && <option value={p.role} disabled>{lab(p.role)}</option>}
                  {options.map(o => <option key={o} value={o}>{lab(o)}</option>)}</select>
                <button className="btn sm">Enregistrer</button></form>
            ) : <span className="chip">{lab(p.role)}</span>}
          </div>)
      })}
    </section>
    <p className="meta">Journaliste : écrit des articles. Éditeur : valide, publie, modère les commentaires et gère Tolobana TV. Administrateur : rédacteurs, newsletter, partenaires, journal.</p>
  </>)
}
