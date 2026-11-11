// Évite qu'une panne de source de données fasse tomber toute la page : l'erreur est journalisée (Vercel > Logs) et affichée en clair.
export async function safe(fn, tag) {
  try { return { v: await fn() } } catch (e) { console.error(`[${tag}]`, e); return { err: String(e?.message || e).slice(0, 200) } }
}
