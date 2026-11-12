'use client'
import { useEffect, useState } from 'react'
const key = k => { const p = '='.repeat((4 - k.length % 4) % 4), r = atob((k + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(r, c => c.charCodeAt(0)) }
export default function PushButton({ publicKey }) {
  const [st, setSt] = useState('init'), [msg, setMsg] = useState('')
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) { setSt('unsupported'); return }
    if (Notification.permission === 'denied') { setSt('denied'); return }
    navigator.serviceWorker.ready.then(r => r.pushManager.getSubscription()).then(s => setSt(s ? 'on' : 'off')).catch(() => setSt('off'))
  }, [])
  async function on() {
    setMsg('')
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setSt(perm === 'denied' ? 'denied' : 'off'); return }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key(publicKey) })
      const r = await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub.toJSON()) })
      if (!r.ok) throw new Error()
      setSt('on')
    } catch { setMsg('Activation impossible pour le moment. Réessayez dans un instant.') }
  }
  async function off() {
    try {
      const reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription()
      if (sub) { await fetch('/api/push/unsubscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) }); await sub.unsubscribe() }
      setSt('off')
    } catch { setMsg('Désactivation impossible pour le moment.') }
  }
  if (st === 'init') return null
  if (st === 'unsupported') return <p className="meta">Votre navigateur ne gère pas les alertes. Sur iPhone, ajoutez d’abord le site à l’écran d’accueil. Sur Android, utilisez Chrome.</p>
  if (st === 'denied') return <p className="meta">Les notifications sont bloquées pour ce site. Autorisez-les dans les réglages du navigateur (cadenas à côté de l’adresse), puis rechargez.</p>
  return (<div><button type="button" className={st === 'on' ? 'btn ghost' : 'btn'} onClick={st === 'on' ? off : on}>{st === 'on' ? 'Désactiver les alertes' : 'Activer les alertes'}</button>
    {st === 'on' && <p className="meta" role="status">Alertes activées sur cet appareil.</p>}{msg && <p className="err" role="alert">{msg}</p>}</div>)
}
