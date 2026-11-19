// Outils de gestion des articles « à la WordPress » : états, onglets, révisions, comparaison.
export const STATUS_LABEL = { draft: 'Brouillon', submitted: 'À valider', published: 'Publié', scheduled: 'Programmé', rejected: 'Rejeté', trash: 'Corbeille' }
export const TABS = [['', 'Tous'], ['draft', 'Brouillons'], ['submitted', 'À valider'], ['scheduled', 'Programmés'], ['published', 'Publiés'], ['rejected', 'Rejetés'], ['trash', 'Corbeille']]
export const stateOf = a => (a.status === 'published' && a.published_at && new Date(a.published_at).getTime() > Date.now() ? 'scheduled' : a.status)
export const cleanQ = v => String(v || '').replace(/[%_,()*\\]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60)

// Enregistre l'état actuel d'un article comme révision (ignoré si identique à la dernière ; ne bloque jamais l'enregistrement).
export async function saveRevision(sb, a, userId, note = null) {
  try {
    const { data: last } = await sb.from('article_revisions').select('title,blocks').eq('article_id', a.id).order('created_at', { ascending: false }).limit(1)
    const l = last?.[0]
    if (l && l.title === a.title && JSON.stringify(l.blocks) === JSON.stringify(a.blocks)) return
    await sb.from('article_revisions').insert({ article_id: a.id, title: a.title, subtitle: a.subtitle ?? null, summary: a.summary ?? null, image_url: a.image_url ?? null, blocks: a.blocks ?? null, note, saved_by: userId })
    const { data: old } = await sb.from('article_revisions').select('id').eq('article_id', a.id).order('created_at', { ascending: false }).range(40, 200)
    if (old?.length) await sb.from('article_revisions').delete().in('id', old.map(x => x.id))
  } catch {}
}

// Comparaison ligne à ligne (LCS) : [{ t: 'same' | 'add' | 'del', s }]
export function lineDiff(before, after, cap = 300) {
  const A = String(before || '').split('\n').slice(0, cap), B = String(after || '').split('\n').slice(0, cap)
  const n = A.length, m = B.length, L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1])
  const out = []; let i = 0, j = 0
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push({ t: 'same', s: A[i] }); i++; j++ }
    else if (L[i + 1][j] >= L[i][j + 1]) out.push({ t: 'del', s: A[i++] })
    else out.push({ t: 'add', s: B[j++] })
  }
  while (i < n) out.push({ t: 'del', s: A[i++] })
  while (j < m) out.push({ t: 'add', s: B[j++] })
  return out
}
// Liens de menu saisis dans « Apparence » : une ligne « Libellé | /chemin » ou « Libellé | https://… ».
export function parseMenuLinks(txt) {
  return String(txt || '').split('\n').map(l => l.split('|').map(x => x.trim())).filter(([a, b]) => a && b && (/^\/(?!\/)[\w\-./?=&%#]*$/.test(b) || /^https:\/\/[^\s]+$/.test(b))).slice(0, 8).map(([label, href]) => ({ label: label.slice(0, 30), href }))
}
export const HOME_BLOCKS = [['weather', 'Météo'], ['rates', 'Taux de change'], ['sport', 'Sport (matchs)'], ['agenda', 'Agenda'], ['poll', 'Sondage du jour'], ['most', 'Les plus lus']]
