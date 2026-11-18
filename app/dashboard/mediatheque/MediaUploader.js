'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
export default function MediaUploader() {
  const ref = useRef(null), router = useRouter(), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false), [errs, setErrs] = useState([])
  async function go(files) {
    if (!files.length) return
    setBusy(true); setErrs([]); const bad = []
    for (let i = 0; i < files.length; i++) {
      setMsg(`Envoi ${i + 1} sur ${files.length} : ${files[i].name}`)
      const fd = new FormData(); fd.append('file', files[i])
      try { const r = await fetch('/api/mediatheque', { method: 'POST', body: fd }); if (!r.ok) bad.push(`${files[i].name} : ${(await r.json().catch(() => ({}))).error || 'échec'}`) } catch { bad.push(`${files[i].name} : connexion perdue`) }
    }
    setBusy(false); setMsg(bad.length < files.length ? `${files.length - bad.length} fichier(s) ajouté(s).` : ''); setErrs(bad)
    if (ref.current) ref.current.value = ''
    router.refresh()
  }
  return (<div className="mt-drop">
    <p style={{ margin: '0 0 10px' }}><b>Ajouter des fichiers</b><br /><span className="meta">Images, PDF, Word, Excel, PowerPoint, texte, MP3 · 4 Mo maximum chacun</span></p>
    <input ref={ref} type="file" multiple disabled={busy} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.mp3,.m4a" onChange={e => go([...e.target.files])} />
    {msg && <p className="mt-prog" role="status">{msg}</p>}
    {errs.map((e, i) => <p key={i} className="err" role="alert">{e}</p>)}</div>)
}
