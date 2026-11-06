import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { signOut } from '../login/actions'
import DashNav from './DashNav'

export const metadata = { title: 'Espace rédaction', robots: { index: false, follow: false } }

// Tout l'espace rédaction est réservé à l'équipe : un lecteur connecté est renvoyé à l'accueil.
export default async function DashboardLayout({ children }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user) redirect('/login')
  if (!atLeast(role, 'journalist')) redirect('/')
  const { data: me } = await sb.from('profiles').select('name').eq('id', user.id).single()
  const items = [
    { href: '/dashboard', label: 'Vue d’ensemble' },
    { href: '/dashboard/nouvel-article', label: 'Écrire un article' },
    { href: '/dashboard/articles', label: atLeast(role, 'editor') ? 'Tous les articles' : 'Mes articles' },
    ...(atLeast(role, 'admin') ? [{ href: '/dashboard/auteurs', label: 'Rédacteurs' }] : []),
    ...(atLeast(role, 'editor') ? [{ href: '/dashboard/moderation', label: 'Commentaires' }] : []),
    ...(atLeast(role, 'admin') ? [{ href: '/dashboard/partenaires', label: 'Partenaires' }] : []),
    { href: '/dashboard/profil', label: 'Mon profil' },
  ]
  return (
    <main className="wrap dash">
      <aside className="dash-side">
        <div className="who"><span className="who-name">{me?.name || 'Mon espace'}</span><span className="who-role">{role}</span></div>
        <DashNav items={items} />
        <form action={signOut}><button className="btn ghost sm out">Déconnexion</button></form>
      </aside>
      <section className="dash-main">{children}</section>
    </main>)
}
