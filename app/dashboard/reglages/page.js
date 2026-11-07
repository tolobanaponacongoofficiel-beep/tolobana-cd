import { redirect } from 'next/navigation'
import { getUserAndRole, atLeast } from '@/lib/supabase/server'
import { SETTING_FIELDS, getSettings } from '@/lib/settings'
import { PAGES, PAGE_SLUGS } from '@/lib/pages'
import ConfirmButton from '../../components/ConfirmButton'
import { saveSettings, savePage } from './actions'
export const metadata = { title: 'Pages et réglages' }
export default async function Reglages({ searchParams }) {
  const { sb, user, role } = await getUserAndRole()
  if (!user || !atLeast(role, 'admin')) redirect('/dashboard')
  const [s, { data: rows }] = await Promise.all([getSettings(sb), sb.from('pages').select('slug,body')])
  const over = Object.fromEntries((rows || []).map(r => [r.slug, r.body]))
  return (<>
    <div className="dash-head"><h1>Pages et réglages</h1></div>
    {searchParams?.ok && <p style={{ color: '#1a7f3c', fontWeight: 600 }}>Enregistré ✓</p>}
    <section className="panel"><h2>Informations du média</h2>
      <p className="meta">Ces informations remplissent automatiquement les pages À propos, Contact, Mentions légales, Charte et Confidentialité. Les champs vides s’affichent « [à compléter] » sur le site.</p>
      <form className="f" action={saveSettings}>
        {SETTING_FIELDS.map(([k, label]) => <label key={k}>{label}<input name={k} maxLength={300} defaultValue={s[k] || ''} /></label>)}
        <div><button className="btn">Enregistrer</button></div></form></section>
    <section className="panel"><h2>Textes des pages</h2>
      <p className="meta">Balisage : « ## Titre » pour un intertitre, « - » pour une puce, une ligne vide pour un nouveau paragraphe. {'{{email}}'}, {'{{director}}'}… sont remplacés par les informations ci-dessus.</p>
      {PAGE_SLUGS.map(slug => (
        <details key={slug} style={{ marginBottom: 10 }}><summary><b>{PAGES[slug].title}</b>{over[slug] ? ' (personnalisée)' : ' (texte par défaut)'}</summary>
          <form className="f" action={savePage}><input type="hidden" name="slug" value={slug} />
            <textarea name="body" rows={16} defaultValue={over[slug] || PAGES[slug].body} />
            <div style={{ display: 'flex', gap: 8 }}><button className="btn sm" name="intent" value="save">Enregistrer</button>
              {over[slug] && <ConfirmButton message="Rétablir le texte par défaut ?" name="intent" value="reset">Rétablir le texte par défaut</ConfirmButton>}</div>
          </form></details>))}
    </section></>)
}
