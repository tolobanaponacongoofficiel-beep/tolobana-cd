export default function Crest({ src, name, size = 22, saver = false }) {
  const ini = String(name || '?').trim().slice(0, 2).toUpperCase()
  if (src && !saver) return <img className="cr" src={src} alt="" width={size} height={size} loading="lazy" referrerPolicy="no-referrer" />
  return <span className="cr ini" style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }} aria-hidden="true">{ini}</span>
}
