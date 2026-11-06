'use client'
import { useRef, useState } from 'react'
import ImageUploader from './ImageUploader'
import ArticleBody from './ArticleBody'
import { youtubeId } from '@/lib/blocks'

const uid = () => Math.random().toString(36).slice(2, 10)
export const newBlock = type => ({ id: uid(), type, text: '', url: '', caption: '' })

const KINDS = [
  ['p', '¶', 'Paragraphe'], ['h2', 'T', 'Titre'], ['h3', 't', 'Sous-titre'], ['image', '▣', 'Image'],
  ['youtube', '▶', 'Vidéo YouTube'], ['quote', '❝', 'Citation'], ['list', '☰', 'Liste'], ['link', '↗', 'Lien'], ['hr', '—', 'Séparateur'],
]
const LABEL = Object.fromEntries(KINDS.map(([t, , l]) => [t, l]))

export default function BlockEditor({ blocks, setBlocks }) {
  const [sel, setSel] = useState(0)
  const [preview, setPreview] = useState(false)
  const refs = useRef({})

  const patch = (id, p) => setBlocks(bs => bs.map(b => (b.id === id ? { ...b, ...p } : b)))
  const add = type => {
    const at = blocks.length ? Math.min(sel, blocks.length - 1) + 1 : 0
    setBlocks(bs => { const c = [...bs]; c.splice(at, 0, newBlock(type)); return c })
    setSel(at)
  }
  const move = (i, d) => {
    const j = i + d
    if (j < 0 || j >= blocks.length) return
    setBlocks(bs => { const c = [...bs]; [c[i], c[j]] = [c[j], c[i]]; return c })
    setSel(j)
  }
  const remove = i => { setBlocks(bs => bs.filter((_, k) => k !== i)); setSel(Math.max(0, i - 1)) }

  // Gras / italique / lien autour du texte sélectionné dans un paragraphe
  const wrap = (id, kind) => {
    const ta = refs.current[id]
    if (!ta) return
    const { selectionStart: s, selectionEnd: e, value } = ta
    const chosen = value.slice(s, e)
    let ins
    if (kind === 'link') {
      const u = window.prompt('Adresse du lien (commence par https://)', 'https://')
      if (!u || !/^https?:\/\/\S+$/.test(u.trim())) return
      ins = `[${chosen || 'texte du lien'}](${u.trim()})`
    } else if (kind === 'bold') ins = `**${chosen || 'texte en gras'}**`
    else ins = `*${chosen || 'texte en italique'}*`
    patch(id, { text: value.slice(0, s) + ins + value.slice(e) })
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s, s + ins.length) })
  }

  const body = (b) => {
    switch (b.type) {
      case 'p': return (<>
        <div className="fmt">
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => wrap(b.id, 'bold')} aria-label="Gras"><b>G</b></button>
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => wrap(b.id, 'italic')} aria-label="Italique"><i>I</i></button>
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => wrap(b.id, 'link')} aria-label="Ajouter un lien">Lien</button>
        </div>
        <textarea ref={el => { refs.current[b.id] = el }} rows={5} value={b.text} onChange={e => patch(b.id, { text: e.target.value })} placeholder="Écrivez votre paragraphe…" /></>)
      case 'h2': return <input value={b.text} onChange={e => patch(b.id, { text: e.target.value })} placeholder="Titre de la partie" maxLength={300} />
      case 'h3': return <input value={b.text} onChange={e => patch(b.id, { text: e.target.value })} placeholder="Sous-titre" maxLength={300} />
      case 'image': return (<>
        <ImageUploader value={b.url} onChange={url => patch(b.id, { url })} label="Choisir une image" />
        <input value={b.caption} onChange={e => patch(b.id, { caption: e.target.value })} placeholder="Légende et crédit photo" maxLength={300} /></>)
      case 'youtube': {
        const id = youtubeId(b.url)
        return (<>
          <input value={b.url} onChange={e => patch(b.id, { url: e.target.value })} placeholder="Collez le lien YouTube (https://www.youtube.com/watch?v=…)" inputMode="url" />
          {b.url && !id && <p className="err">Ce lien n'est pas un lien YouTube reconnu.</p>}
          {id && <div className="yt-prev"><img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" /><span>Vidéo reconnue</span></div>}
          <input value={b.caption} onChange={e => patch(b.id, { caption: e.target.value })} placeholder="Légende (facultatif)" maxLength={300} /></>)
      }
      case 'quote': return (<>
        <textarea rows={3} value={b.text} onChange={e => patch(b.id, { text: e.target.value })} placeholder="Texte de la citation" />
        <input value={b.caption} onChange={e => patch(b.id, { caption: e.target.value })} placeholder="Qui parle ? (nom, fonction)" maxLength={200} /></>)
      case 'list': return <textarea rows={4} value={b.text} onChange={e => patch(b.id, { text: e.target.value })} placeholder={'Un élément par ligne\nDeuxième élément\nTroisième élément'} />
      case 'link': return (<>
        <input value={b.text} onChange={e => patch(b.id, { text: e.target.value })} placeholder="Texte du lien (ex. Lire le communiqué)" maxLength={150} />
        <input value={b.url} onChange={e => patch(b.id, { url: e.target.value })} placeholder="https://…" inputMode="url" /></>)
      case 'hr': return <p className="meta">Une ligne de séparation sera affichée ici.</p>
      default: return null
    }
  }

  return (
    <div className="editor">
      <div className="ed-bar" role="toolbar" aria-label="Ajouter un bloc">
        <span className="ed-hint">Ajouter après le bloc sélectionné :</span>
        <div className="ed-kinds">{KINDS.map(([t, g, l]) => (
          <button key={t} type="button" className="kind" onClick={() => add(t)}><span aria-hidden="true">{g}</span>{l}</button>))}</div>
        <button type="button" className={preview ? 'btn sm' : 'btn ghost sm'} onClick={() => setPreview(p => !p)}>{preview ? "Revenir à l'édition" : 'Aperçu'}</button>
      </div>

      {preview ? (
        <div className="ed-preview article-preview"><ArticleBody blocks={blocks} />
          {!blocks.length && <p className="meta">Rien à afficher pour le moment.</p>}</div>
      ) : (<>
        {!blocks.length && <p className="ed-empty">Aucun bloc. Choisissez un type de bloc ci-dessus pour commencer.</p>}
        {blocks.map((b, i) => (
          <div key={b.id} className={`blk${i === sel ? ' on' : ''}`} onFocusCapture={() => setSel(i)} onClick={() => setSel(i)}>
            <div className="blk-head">
              <span className="blk-type">{LABEL[b.type]}</span>
              <span className="blk-tools">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter ce bloc">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label="Descendre ce bloc">↓</button>
                <button type="button" className="del" onClick={() => remove(i)} aria-label="Supprimer ce bloc">Supprimer</button>
              </span>
            </div>
            <div className="blk-body">{body(b)}</div>
          </div>))}
      </>)}
    </div>)
}
