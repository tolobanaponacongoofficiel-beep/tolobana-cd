// « Kinshasa, #Léopards ; CAN 2027 » -> ['Kinshasa', 'Léopards', 'CAN 2027'] (8 maximum, sans doublon)
export function parseTags(raw) {
  const seen = new Set(), out = []
  for (let t of String(raw || '').split(/[,;\n]/)) {
    t = t.replace(/^#+/, '').replace(/\s+/g, ' ').trim().slice(0, 40)
    const k = t.toLowerCase()
    if (!t || seen.has(k)) continue
    seen.add(k); out.push(t)
    if (out.length >= 8) break
  }
  return out
}
