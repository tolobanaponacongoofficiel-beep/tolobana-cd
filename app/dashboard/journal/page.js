import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { isUuid } from '@/lib/blocks'
import { fmtKin } from '@/lib/dates'
import '../../components/phase8.css'

export const metadata = { title: 'Journal d’activité' }
const ACTION = {
  publish: 'a publié', publish_breaking: 'a publié en dernière minute', schedule: 'a programmé la publication de', reject: 'a rejeté', article_edit: 'a modifié',
  unpublish: 'a retiré du site', article_delete: 'a supprimé l’article', author_add: 'a ajouté le rédacteur', author_update: 'a modifié un rédacteur', author_delete: 'a supprimé un rédacteur',
  partner_add: 'a ajouté le partenaire', partner_delete: 'a supprimé un partenaire', partner_banner: 'a changé la bannière d’un partenaire',
  newsletter_send: 'a envoyé la newsletter à', newsletter_test: 'a envoyé un test de newsletter à', subscriber_delete: 'a supprimé un abonné',
  comment_approve: 'a approuvé un commentaire', comment_delete: 'a supprimé un commentaire', comment_dismiss: 'a ignoré un signalement', role_change: 'a changé le rôle :',
}

export default async function Journal() {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/dashboard')
  const { data: logs, error } = await sb.from('audit_log').select('*').order('created_at', { ascending: false }).limit(100)
  const userIds = [...new Set((logs || []).map(l => l.user_id).filter(isUuid))]
  const artIds = [...new Set((logs || []).map(l => l.target).filter(isUuid))]
  const [{ data: people }, { data: arts }] = await Promise.all([
    userIds.length ? sb.from('profiles').select('id,name').in('id', userIds) : { data: [] },
    artIds.length ? sb.from('articles').select('id,title').in('id', artIds) : { data: [] },
  ])
  const who = Object.fromEntries((people || []).map(p => [p.id, p.name]))
  const what = Object.fromEntries((arts || []).map(a => [a.id, a.title]))
  const target = l => {
    if (l.action.startsWith('newsletter')) return `${l.target} abonné(s)`
    if (isUuid(l.target)) return what[l.target] ? `« ${what[l.target]} »` : ''
    return l.target ? `« ${String(l.target).slice(0, 80)} »` : ''
  }
  return (<>
    <div className="dash-head"><h1>Journal d’activité</h1></div>
    <p className="lead">Les 100 dernières actions de l’équipe : qui a publié, modifié, supprimé ou envoyé quoi.</p>
    {error && <p className="notice bad" role="alert">Le journal n’a pas pu être lu ({error.message}).</p>}
    <section className="panel">
      {!logs?.length && !error && <p className="meta">Aucune activité enregistrée pour le moment.</p>}
      {(logs || []).map(l => (
        <div key={l.id ?? `${l.created_at}-${l.target}`} className="log">
          <time dateTime={l.created_at}>{l.created_at ? fmtKin(l.created_at, { dateStyle: 'short', timeStyle: 'short' }) : ''}</time>
          <span><b>{who[l.user_id] || 'Quelqu’un'}</b> {ACTION[l.action] || l.action} {target(l)}</span>
        </div>))}
    </section>
  </>)
}
