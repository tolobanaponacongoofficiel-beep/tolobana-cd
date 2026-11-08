import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { signOut } from '../login/actions'
import DashNav from './DashNav'
import Avatar from '../components/Avatar'
import Link from 'next/link'
import { getSettings, missingRequired } from '@/lib/settings'

export const metadata = { title: 'Espace rédaction', robots: { index: false, follow: false } }

// Tout l'espace rédaction est réservé à l'équipe : un lecteur connecté est renvoyé à l'accueil.
export default async function DashboardLayout({ children }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user) redirect('/login')
  if (!atLeast(role, 'journalist')) redirect('/')
  const { data: me } = await sb.from('profiles').select('name,photo_url').eq('id', user.id).single()
  const missing = atLeast(role, 'admin') ? missingRequired(await getSettings(sb)) : []
  const items = [
    { href: '/dashboard', label: 'Vue d’ensemble' },
    { href: '/dashboard/nouvel-article', label: 'Écrire un article' },
    { href: '/dashboard/articles', label: atLeast(role, 'editor') ? 'Tous les articles' : 'Mes articles' },
    ...(atLeast(role, 'admin') ? [{ href: '/dashboard/auteurs', label: 'Rédacteurs' }] : []),
    ...(atLeast(role, 'editor') ? [{ href: '/dashboard/moderation', label: 'Commentaires' }] : []),
    ...(atLeast(role, 'editor') ? [{ href: '/dashboard/statistiques', label: 'Statistiques' }] : []),
    ...(atLeast(role, 'editor') ? [{ href: '/dashboard/videos', label: 'Tolobana TV' }] : []),
    ...(atLeast(role, 'admin') ? [{ href: '/dashboard/newsletter', label: 'Newsletter' }] : []),
    ...(atLeast(role, 'admin') ? [{ href: '/dashboard/partenaires', label: 'Partenaires' }] : []),
    ...(atLeast(role, 'admin') ? [{ href: '/dashboard/equipe', label: 'Équipe et rôles' }] : []),
    ...(atLeast(role, 'admin') ? [{ href: '/dashboard/journal', label: 'Journal d’activité' }] : []),
    ...(atLeast(role, 'editor') ? [{ href: '/dashboard/a-la-une', label: 'À la une' }, { href: '/dashboard/dossiers', label: 'Dossiers' }, { href: '/dashboard/sondages', label: 'Sondages' }, { href: '/dashboard/direct', label: 'Direct' }] : []),
    ...(atLeast(role, 'admin') ? [{ href: '/dashboard/publicites', label: 'Publicités' }] : []),
    ...(atLeast(role, 'admin') ? [{ href: '/dashboard/messages', label: 'Messages reçus' }, { href: '/dashboard/reglages', label: 'Pages et réglages' }] : []),
    { href: '/dashboard/profil', label: 'Mon profil' },
  ]
  return (
    <main className="wrap dash">
      <aside className="dash-side">
        <div className="who"><Avatar name={me?.name} url={me?.photo_url} /><span className="who-text"><span className="who-name">{me?.name || 'Mon espace'}</span><span className="who-role">{role}</span></span></div>
        <DashNav items={items} />
        <form action={signOut}><button className="btn ghost sm out">Déconnexion</button></form>
      </aside>
      <section className="dash-main">
        {missing.length > 0 && <p className="notice bad" role="alert">Mentions légales incomplètes : renseignez {missing.join(', ')} dans <Link href="/dashboard/reglages"><u>Pages et réglages</u></Link>. Le site affiche « non communiqué » en attendant.</p>}
        {children}</section>
    </main>)
}
