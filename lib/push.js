// Notifications push Web (RFC 8030, 8291, 8292) sans dépendance externe. Variables : VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY.
import crypto from 'node:crypto'
import { SITE_URL } from './site'
const b64u = b => Buffer.from(b).toString('base64url')
const unb64u = s => Buffer.from(String(s), 'base64url')
export const pushReady = () => !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
export function generateVapid() {
  const { privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' })
  const j = privateKey.export({ format: 'jwk' })
  return { publicKey: b64u(Buffer.concat([Buffer.from([4]), unb64u(j.x), unb64u(j.y)])), privateKey: j.d }
}
function vapidHeader(endpoint, pub, priv) {
  const u = new URL(endpoint), p = unb64u(pub)
  const key = crypto.createPrivateKey({ format: 'jwk', key: { kty: 'EC', crv: 'P-256', x: b64u(p.subarray(1, 33)), y: b64u(p.subarray(33, 65)), d: priv } })
  const head = b64u(JSON.stringify({ typ: 'JWT', alg: 'ES256' })), body = b64u(JSON.stringify({ aud: u.origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: String(SITE_URL).startsWith('https://') ? SITE_URL : 'https://tolobana.cd' }))
  const sig = crypto.sign('sha256', Buffer.from(`${head}.${body}`), { key, dsaEncoding: 'ieee-p1363' })
  return `vapid t=${head}.${body}.${b64u(sig)}, k=${pub}`
}
// Chiffrement du message pour un abonné (aes128gcm)
export function encryptPayload(payload, p256dh, auth) {
  const ua = unb64u(p256dh), authSecret = unb64u(auth)
  const ecdh = crypto.createECDH('prime256v1'); ecdh.generateKeys()
  const as = ecdh.getPublicKey(), secret = ecdh.computeSecret(ua), salt = crypto.randomBytes(16)
  const ikm = Buffer.from(crypto.hkdfSync('sha256', secret, authSecret, Buffer.concat([Buffer.from('WebPush: info\0'), ua, as]), 32))
  const cek = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16))
  const nonce = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: nonce\0'), 12))
  const c = crypto.createCipheriv('aes-128-gcm', cek, nonce)
  const enc = Buffer.concat([c.update(Buffer.concat([Buffer.from(payload), Buffer.from([2])])), c.final(), c.getAuthTag()])
  const rs = Buffer.alloc(4); rs.writeUInt32BE(4096)
  return Buffer.concat([salt, rs, Buffer.from([as.length]), as, enc])
}
// Envoie à un abonné. Retourne 'ok', 'gone' (abonnement expiré) ou 'fail'.
export async function sendPush(sub, message, { ttl = 86400, urgency = 'high' } = {}) {
  try {
    const body = encryptPayload(JSON.stringify(message), sub.p256dh, sub.auth)
    const res = await fetch(sub.endpoint, { method: 'POST', body, headers: { Authorization: vapidHeader(sub.endpoint, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY), 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', TTL: String(ttl), Urgency: urgency } })
    return res.status === 404 || res.status === 410 ? 'gone' : res.ok ? 'ok' : 'fail'
  } catch { return 'fail' }
}
export async function sendMany(subs, message) {
  const out = { ok: 0, fail: 0, gone: [] }
  for (let i = 0; i < subs.length; i += 25) {
    const r = await Promise.all(subs.slice(i, i + 25).map(s => sendPush(s, message)))
    r.forEach((x, k) => { if (x === 'ok') out.ok++; else if (x === 'gone') out.gone.push(subs[i + k].endpoint); else out.fail++ })
  }
  return out
}
