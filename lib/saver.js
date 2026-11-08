import { cookies, headers } from 'next/headers'
// Mode léger : activé par le lecteur (cookie) ou par le navigateur (en-tête Save-Data).
export function saverOn() {
  try { return cookies().get('tl_saver')?.value === '1' || headers().get('save-data') === 'on' } catch { return false }
}
