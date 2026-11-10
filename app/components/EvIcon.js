// Pictogrammes de la chronologie d'un match (SVG, pas d'emoji)
export default function EvIcon({ kind }) {
  const p = { width: 18, height: 18, viewBox: '0 0 24 24', 'aria-hidden': true, className: `ev-ic ${kind}` }
  if (kind === 'yellow' || kind === 'red') return <svg {...p}><rect x="6" y="3" width="12" height="18" rx="2" fill={kind === 'red' ? '#d64545' : '#f2c230'} /></svg>
  if (kind === 'sub') return <svg {...p}><path d="M8 3l5 7H3z" fill="#1f9d55" transform="translate(1 0)" /><path d="M16 21l-5-7h10z" fill="#d64545" transform="translate(-1 0)" /></svg>
  const c = kind === 'own_goal' ? '#d64545' : 'currentColor'
  return <svg {...p}><circle cx="12" cy="12" r="9" fill="none" stroke={c} strokeWidth="2" /><path d="M12 7l4 3-1.5 4.5h-5L8 10z" fill={c} /></svg>
}
