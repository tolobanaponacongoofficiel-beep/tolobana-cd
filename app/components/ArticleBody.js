import { youtubeId, safeUrl } from '@/lib/blocks'
import LazyMedia from './LazyMedia'

// Mise en forme légère dans les paragraphes : **gras**, *italique*, [texte](https://lien)
const RX = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\(https?:\/\/[^\s)]+\))/g

function inline(text, k) {
  return String(text).split(RX).map((part, i) => {
    let m
    if ((m = part.match(/^\*\*([^*\n]+)\*\*$/))) return <strong key={`${k}-${i}`}>{m[1]}</strong>
    if ((m = part.match(/^\*([^*\n]+)\*$/))) return <em key={`${k}-${i}`}>{m[1]}</em>
    if ((m = part.match(/^\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)$/)))
      return <a key={`${k}-${i}`} href={m[2]} target="_blank" rel="noopener noreferrer">{m[1]}</a>
    return part
  })
}

function lines(text, k) {
  return String(text).split('\n').flatMap((line, li) => [li > 0 && <br key={`${k}-br${li}`} />, ...inline(line, `${k}-${li}`)])
}

export default function ArticleBody({ blocks, saver = false }) {
  return (
    <div className="body">
      {(blocks || []).map((b, i) => {
        const k = b.id || i
        switch (b.type) {
          case 'p': return b.text?.trim() ? <p key={k}>{lines(b.text, k)}</p> : null
          case 'h2': return b.text?.trim() ? <h2 key={k}>{b.text}</h2> : null
          case 'h3': return b.text?.trim() ? <h3 key={k}>{b.text}</h3> : null
          case 'image': {
            const src = safeUrl(b.url)
            return src ? <figure key={k} className="inline">{saver ? <LazyMedia src={src} alt={b.caption} /> : <img src={src} alt={b.caption || ''} loading="lazy" />}{b.caption && <figcaption>{b.caption}</figcaption>}</figure> : null
          }
          case 'youtube': {
            const id = youtubeId(b.url)
            return id ? (
              <figure key={k} className="inline">
                {saver ? <LazyMedia yt={id} alt={b.caption} label="Lire la vidéo (consomme des données)" /> : null}
                {!saver && <div className="video"><iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={b.caption || 'Vidéo YouTube'} loading="lazy"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>}
                {b.caption && <figcaption>{b.caption}</figcaption>}
              </figure>) : null
          }
          case 'quote': return b.text?.trim() ? <blockquote key={k}><p>{lines(b.text, k)}</p>{b.caption && <cite>{b.caption}</cite>}</blockquote> : null
          case 'list': {
            const items = String(b.text || '').split('\n').map(s => s.trim()).filter(Boolean)
            return items.length ? <ul key={k}>{items.map((it, j) => <li key={j}>{inline(it, `${k}-${j}`)}</li>)}</ul> : null
          }
          case 'link': {
            const href = safeUrl(b.url)
            return href ? <p key={k} className="b-link"><a href={href} target="_blank" rel="noopener noreferrer">{b.text || href}</a></p> : null
          }
          case 'hr': return <hr key={k} />
          default: return null
        }
      })}
    </div>)
}
