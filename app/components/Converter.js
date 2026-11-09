'use client'
import { useState } from 'react'
import './phase12.css'
const fmt = n => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(n)
// Convertisseur CDF / USD / EUR. `rates` = combien de CDF pour 1 unité.
export default function Converter({ rates }) {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('CDF')
  const n = Number(String(amount).replace(/\s/g, '').replace(',', '.'))
  const ok = Number.isFinite(n) && n >= 0 && rates[from] && rates[to]
  const out = ok ? n * rates[from] / rates[to] : null
  const cur = Object.keys(rates)
  return (
    <form className="conv" onSubmit={e => e.preventDefault()} aria-label="Convertisseur de devises">
      <label>Montant<input inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} /></label>
      <label>De<select value={from} onChange={e => setFrom(e.target.value)}>{cur.map(c => <option key={c}>{c}</option>)}</select></label>
      <button type="button" className="btn gray sm" aria-label="Inverser" onClick={() => { setFrom(to); setTo(from) }}>⇄</button>
      <label>Vers<select value={to} onChange={e => setTo(e.target.value)}>{cur.map(c => <option key={c}>{c}</option>)}</select></label>
      <p className="conv-out" role="status">{out != null ? <>{fmt(n)} {from} = <strong>{fmt(out)} {to}</strong></> : 'Entrez un montant.'}</p>
    </form>)
}
