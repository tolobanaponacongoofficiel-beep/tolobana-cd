'use client'
import { useState } from 'react'
import { bulk } from './actions'
const LABEL = { trash: 'Mettre à la corbeille', publish: 'Publier maintenant', draft: 'Remettre en brouillon', reject: 'Rejeter', restore: 'Restaurer', delete: 'Supprimer définitivement', category: 'Changer la rubrique', tag: 'Ajouter une étiquette' }
// Barre d'actions groupées : les cases à cocher des lignes pointent vers ce formulaire (attribut form="bulk").
export default function BulkBar({ ops, cats, back }) {
  const [op, setOp] = useState(ops[0])
  const toggle = e => { document.querySelectorAll('input[name="ids"][form="bulk"]').forEach(c => { c.checked = e.target.checked }) }
  const submit = e => {
    const n = document.querySelectorAll('input[name="ids"][form="bulk"]:checked').length
    if (!n) { e.preventDefault(); window.alert('Cochez au moins un article.'); return }
    if ((op === 'delete' || op === 'trash') && !window.confirm(op === 'delete' ? `Supprimer définitivement ${n} article(s) ? Cette action est irréversible.` : `Mettre ${n} article(s) à la corbeille ?`)) e.preventDefault()
  }
  return (<form id="bulk" action={bulk} onSubmit={submit} className="bulk">
    <input type="hidden" name="back" value={back} />
    <label className="bulk-all"><input type="checkbox" onChange={toggle} aria-label="Tout sélectionner" /> Tout</label>
    <select name="op" value={op} onChange={e => setOp(e.target.value)} aria-label="Action groupée">{ops.map(o => <option key={o} value={o}>{LABEL[o]}</option>)}</select>
    {op === 'category' && <select name="cat" aria-label="Rubrique">{cats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select>}
    {op === 'tag' && <input name="tag" placeholder="étiquette" maxLength={40} aria-label="Étiquette" />}
    <button className="btn sm">Appliquer</button>
  </form>)
}
