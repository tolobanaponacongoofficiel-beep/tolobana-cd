'use client'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import BlockEditor, { newBlock } from '../../components/BlockEditor'
import ImageUploader from '../../components/ImageUploader'
import { isoToKinshasaInput } from '@/lib/dates'

const ERR = {
  incomplet: 'Article non enregistré : il manque le titre, la rubrique ou le contenu. Votre saisie est conservée ci-dessous.',
  enregistrement: 'Article non enregistré : la base de données a refusé l’envoi. Votre saisie est conservée, réessayez.',
}
const TEXT_TYPES = ['p', 'h2', 'h3', 'list', 'quote']
const countWords = blocks => blocks.reduce((n, b) => n + (TEXT_TYPES.includes(b.type) ? String(b.text || '').trim().split(/\s+/).filter(Boolean).length : 0), 0)
const hhmm = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Kinshasa' })

export default function ArticleForm({ action, cats, authors, meName, isEditor, initial }) {
  const edit = !!initial
  const sp = useSearchParams()
  const serverErr = sp.get('err')
  const key = `tolobana-draft:${initial?.id || 'new'}`
  const formRef = useRef(null), dirty = useRef(false), lock = useRef(false), timer = useRef(null)
  const [blocks, setBlocksRaw] = useState(() => initial?.blocks?.length ? initial.blocks.map(b => ({ ...newBlock(b.type), ...b })) : [newBlock('p')])
  const [cover, setCoverRaw] = useState(initial?.image_url || '')
  const [coverVer, setCoverVer] = useState(0)
  const [meta, setMeta] = useState({ title: initial?.title || '', summary: initial?.summary || '', caption: initial?.image_caption || '', tags: (initial?.tags || []).join(', '), publishAt: initial?.scheduled ? isoToKinshasaInput(initial.published_at) : '' })
  const [err, setErr] = useState('')
  const [restore, setRestore] = useState(null)
  const [savedAt, setSavedAt] = useState('')

  const setBlocks = v => { dirty.current = true; setBlocksRaw(v) }
  const setCover = v => { dirty.current = true; setCoverRaw(v) }

  // --- Sauvegarde automatique dans ce navigateur (utile si la connexion coupe) ---
  const persist = () => {
    const f = formRef.current
    if (!f || !dirty.current) return
    const g = n => f.elements[n]?.value ?? ''
    try {
      localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), title: g('title'), subtitle: g('subtitle'), category_id: g('category_id'), writer_id: g('writer_id'),
        summary: g('summary'), image_caption: g('image_caption'), tags: g('tags'), cover, blocks }))
      setSavedAt(hhmm())
    } catch {}
  }
  const queue = () => { clearTimeout(timer.current); timer.current = setTimeout(persist, 1500) }
  useEffect(() => { if (dirty.current) queue(); return () => clearTimeout(timer.current) }, [blocks, cover]) // eslint-disable-line

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(key) || 'null')
      if (!d?.savedAt || Date.now() - d.savedAt > 7 * 864e5) return
      if (d.submittedAt && !serverErr) { localStorage.removeItem(key); return }            // enregistré avec succès : on nettoie
      if (initial?.updated_at && d.savedAt < new Date(initial.updated_at).getTime()) { localStorage.removeItem(key); return } // article modifié depuis
      if (d.title || (d.blocks || []).some(b => String(b.text || b.url || '').trim())) setRestore(d)
    } catch {}
  }, []) // eslint-disable-line

  const doRestore = () => {
    const f = formRef.current, d = restore
    for (const n of ['title', 'subtitle', 'category_id', 'writer_id', 'summary', 'image_caption', 'tags']) if (f.elements[n] && d[n] != null) f.elements[n].value = d[n]
    if (d.blocks?.length) setBlocksRaw(d.blocks.map(b => ({ ...newBlock(b.type), ...b })))
    setCoverRaw(d.cover || ''); setCoverVer(v => v + 1)
    setMeta(m => ({ ...m, title: d.title || '', summary: d.summary || '', caption: d.image_caption || '', tags: d.tags || '' }))
    dirty.current = true; setRestore(null)
  }
  const discard = () => { try { localStorage.removeItem(key) } catch {} setRestore(null) }

  const onInput = () => {
    const f = formRef.current
    dirty.current = true
    setMeta({ title: f.elements.title.value, summary: f.elements.summary.value, caption: f.elements.image_caption.value, tags: f.elements.tags.value, publishAt: f.elements.publish_at?.value || '' })
    queue()
  }

  function check(e) {
    const f = e.currentTarget
    const hasContent = blocks.some(b => b.type === 'hr' ? false : String(b.type === 'image' || b.type === 'youtube' || b.type === 'link' ? b.url : b.text).trim())
    if (!f.elements.title.value.trim()) { e.preventDefault(); setErr('Ajoutez un titre avant d’enregistrer.'); f.elements.title.focus(); return }
    if (!hasContent) { e.preventDefault(); setErr('L’article est vide : ajoutez au moins un paragraphe.'); return }
    if (lock.current) { e.preventDefault(); return }   // évite le double envoi
    lock.current = true; setTimeout(() => { lock.current = false }, 8000)
    clearTimeout(timer.current); dirty.current = false
    try { const d = JSON.parse(localStorage.getItem(key) || '{}'); localStorage.setItem(key, JSON.stringify({ ...d, savedAt: d.savedAt || Date.now(), submittedAt: Date.now() })) } catch {}
    setErr('')
  }

  // --- Check-list avant publication (conseils, jamais bloquant) ---
  const wc = countWords(blocks), mins = Math.max(1, Math.round(wc / 200)), tl = meta.title.trim().length
  const checks = [
    { ok: tl >= 20 && tl <= 90, text: `Titre clair et court (${tl} caractères, idéal : 20 à 90)` },
    { ok: !!cover, text: 'Photo principale ajoutée' },
    ...(cover ? [{ ok: meta.caption.trim().length > 0, text: 'Légende et crédit photo renseignés' }] : []),
    { ok: wc >= 150, text: `Article assez développé (${wc} mots, idéal : 150 et plus)` },
    ...(wc >= 400 ? [{ ok: blocks.some(b => b.type === 'h2' || b.type === 'h3'), text: 'Intertitres pour aérer ce long texte' }] : []),
    { ok: meta.summary.trim().length > 0, text: 'Résumé écrit (sinon le début du 1er paragraphe est repris)' },
    { ok: meta.tags.trim().length > 0, text: 'Au moins un mot-clé' },
  ]
  const done = checks.filter(c => c.ok).length
  const showSchedule = isEditor && (!edit || initial.status !== 'published' || initial.scheduled)
  const publishLabel = meta.publishAt ? 'Programmer la publication' : 'Publier maintenant'

  return (
    <form ref={formRef} action={action} onSubmit={check} onInput={onInput} className="article-form">
      <input type="hidden" name="blocks" value={JSON.stringify(blocks)} />
      {edit && <input type="hidden" name="id" value={initial.id} />}
      {!edit && ERR[serverErr] && <p className="notice bad" role="alert">{ERR[serverErr]}</p>}
      {restore && (
        <div className="notice restore" role="status">
          <span>Un brouillon non enregistré de {new Date(restore.savedAt).toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa', dateStyle: 'short', timeStyle: 'short' })} a été retrouvé sur cet appareil.</span>
          <span className="acts"><button type="button" className="btn sm" onClick={doRestore}>Reprendre</button><button type="button" className="btn ghost sm" onClick={discard}>Ignorer</button></span>
        </div>)}

      <div className="panel">
        <label>Titre
          <input name="title" className="big" placeholder="Le titre de votre article" maxLength={220} required defaultValue={initial?.title || ''} /></label>
        <label>Sous-titre (facultatif)
          <input name="subtitle" placeholder="Une phrase qui complète le titre" maxLength={300} defaultValue={initial?.subtitle || ''} /></label>
        <div className="two">
          <label>Rubrique
            <select name="category_id" required defaultValue={initial?.category_id ?? ''}>
              <option value="" disabled>Choisir une rubrique</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select></label>
          {isEditor && (
            <label>Signé par
              <select name="writer_id" defaultValue={initial?.writer_id || ''}>
                <option value="">Moi-même ({meName})</option>
                {authors.map(a => <option key={a.id} value={a.id}>{a.name}{a.title ? ` — ${a.title}` : ''}</option>)}
              </select></label>)}
        </div>
        <label>Résumé (affiché sur la page d’accueil et dans les partages)
          <textarea name="summary" rows={2} maxLength={400} defaultValue={initial?.summary || ''} placeholder="Deux phrases au plus. Si vous laissez vide, le début du premier paragraphe sera utilisé." /></label>
      </div>

      <div className="panel">
        <h3>Photo principale</h3>
        <ImageUploader key={coverVer} name="image_url" value={cover} onChange={setCover} label="Choisir la photo principale" />
        <label>Légende et crédit photo
          <input name="image_caption" maxLength={300} defaultValue={initial?.image_caption || ''} placeholder="Ex. Le sélectionneur des Léopards. Photo : Fecofa" /></label>
        <label>Mots-clés (séparés par des virgules, 8 maximum)
          <input name="tags" maxLength={200} defaultValue={(initial?.tags || []).join(', ')} placeholder="Ex. Kinshasa, Léopards, CAN 2027" /></label>
      </div>

      <div className="panel">
        <h3>Contenu de l’article</h3>
        <BlockEditor blocks={blocks} setBlocks={setBlocks} />
        <p className="meta wc">{wc} mot{wc > 1 ? 's' : ''} · environ {mins} min de lecture{savedAt ? ` · brouillon sauvegardé sur cet appareil à ${savedAt}` : ''}</p>
      </div>

      <div className="panel checklist">
        <h3>Avant de publier <span className="meta">{done} sur {checks.length}</span></h3>
        <ul>{checks.map(c => <li key={c.text} className={c.ok ? 'ok' : ''}><span aria-hidden="true">{c.ok ? '✓' : '○'}</span>{c.text}<span className="sr-only">{c.ok ? ' : fait' : ' : à vérifier'}</span></li>)}</ul>
        <p className="meta">Ces conseils n’empêchent jamais d’enregistrer ou de publier.</p>
      </div>

      <div className="panel">
        <label className="check"><input type="checkbox" name="is_demo" defaultChecked={!!initial?.is_demo} /> Contenu de démonstration (affiche « DÉMO »)</label>
        {isEditor && <label className="check"><input type="checkbox" name="is_breaking" defaultChecked={!!initial?.is_breaking} /> Dernière minute (bandeau rouge défilant)</label>}
        {isEditor && <fieldset className="fact-fields" style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px', margin: '10px 0' }}>
          <legend>Vérification des faits (facultatif)</legend>
          <input type="hidden" name="fact_had" value={initial?.fact_verdict ? '1' : '0'} />
          <label>Verdict
            <select name="fact_verdict" defaultValue={initial?.fact_verdict || ''}>
              <option value="">Pas une vérification</option><option value="true">Vrai</option><option value="false">Faux</option><option value="misleading">Trompeur</option><option value="unverified">Non vérifié</option></select></label>
          <label>Affirmation vérifiée (la phrase ou la rumeur examinée)<input name="fact_claim" maxLength={300} defaultValue={initial?.fact_claim || ''} /></label>
        </fieldset>}
        {edit && initial.status === 'published' && !initial.scheduled &&
          <label className="check"><input type="checkbox" name="mark_updated" /> Afficher « Mis à jour le … » sur l’article (à cocher pour une correction ou un ajout important)</label>}
        {showSchedule && (
          <label>Programmer la publication (heure de Kinshasa, facultatif)
            <input type="datetime-local" name="publish_at" defaultValue={initial?.scheduled ? isoToKinshasaInput(initial.published_at) : ''} />
            <span className="meta">Laissez vide pour publier tout de suite. Avec une date, l’article apparaît tout seul à l’heure choisie.</span></label>)}
      </div>

      {err && <p className="err" role="alert">{err}</p>}
      <div className="actions sticky-actions">
        {edit ? (<>
          <button className="btn" name="intent" value="save">Enregistrer les modifications</button>
          {initial.status !== 'published' && initial.status !== 'submitted' && !isEditor && <button className="btn gray" name="intent" value="submit">Envoyer pour validation</button>}
          {isEditor && initial.status !== 'published' && <button className="btn gold" name="intent" value="publish">{publishLabel}</button>}
        </>) : (<>
          <button className="btn ghost" name="intent" value="draft">Enregistrer le brouillon</button>
          <button className="btn" name="intent" value="submit">Envoyer pour validation</button>
          {isEditor && <button className="btn gold" name="intent" value="publish">{publishLabel}</button>}
        </>)}
      </div>
    </form>)
}
