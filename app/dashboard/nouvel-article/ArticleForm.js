'use client'
import { useRef, useState } from 'react'
import BlockEditor, { newBlock } from '../../components/BlockEditor'
import ImageUploader from '../../components/ImageUploader'

export default function ArticleForm({ action, cats, authors, meName, isEditor, initial }) {
  const edit = !!initial
  const [blocks, setBlocks] = useState(() => initial?.blocks?.length ? initial.blocks.map(b => ({ ...newBlock(b.type), ...b })) : [newBlock('p')])
  const [err, setErr] = useState('')
  const lock = useRef(false)

  function check(e) {
    const f = e.currentTarget
    const title = f.elements.title.value.trim()
    const hasContent = blocks.some(b => b.type === 'hr' ? false : String(b.type === 'image' || b.type === 'youtube' || b.type === 'link' ? b.url : b.text).trim())
    if (!title) { e.preventDefault(); setErr('Ajoutez un titre avant d’enregistrer.'); f.elements.title.focus(); return }
    if (!hasContent) { e.preventDefault(); setErr('L’article est vide : ajoutez au moins un paragraphe.'); return }
    if (lock.current) { e.preventDefault(); return }   // évite le double envoi
    lock.current = true; setTimeout(() => { lock.current = false }, 8000)
    setErr('')
  }

  return (
    <form action={action} onSubmit={check} className="article-form">
      <input type="hidden" name="blocks" value={JSON.stringify(blocks)} />
      {edit && <input type="hidden" name="id" value={initial.id} />}
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
        <ImageUploader name="image_url" value={initial?.image_url || ''} label="Choisir la photo principale" />
        <label>Légende et crédit photo
          <input name="image_caption" maxLength={300} defaultValue={initial?.image_caption || ''} placeholder="Ex. Le sélectionneur des Léopards. Photo : Fecofa" /></label>
        <label>Mots-clés (séparés par des virgules, 8 maximum)
          <input name="tags" maxLength={200} defaultValue={(initial?.tags || []).join(', ')} placeholder="Ex. Kinshasa, Léopards, CAN 2027" /></label>
      </div>

      <div className="panel">
        <h3>Contenu de l’article</h3>
        <BlockEditor blocks={blocks} setBlocks={setBlocks} />
      </div>

      <div className="panel">
        <label className="check"><input type="checkbox" name="is_demo" defaultChecked={!!initial?.is_demo} /> Contenu de démonstration (affiche « DÉMO »)</label>
        {isEditor && <label className="check"><input type="checkbox" name="is_breaking" defaultChecked={!!initial?.is_breaking} /> Dernière minute (bandeau rouge défilant)</label>}
      </div>

      {err && <p className="err" role="alert">{err}</p>}
      <div className="actions sticky-actions">
        {edit ? (<>
          <button className="btn" name="intent" value="save">Enregistrer les modifications</button>
          {initial.status !== 'published' && initial.status !== 'submitted' && !isEditor && <button className="btn gray" name="intent" value="submit">Envoyer pour validation</button>}
          {isEditor && initial.status !== 'published' && <button className="btn gold" name="intent" value="publish">Publier maintenant</button>}
        </>) : (<>
          <button className="btn ghost" name="intent" value="draft">Enregistrer le brouillon</button>
          <button className="btn" name="intent" value="submit">Envoyer pour validation</button>
          {isEditor && <button className="btn gold" name="intent" value="publish">Publier maintenant</button>}
        </>)}
      </div>
    </form>)
}
