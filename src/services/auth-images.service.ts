import { apiFetch } from '@/services/api'

type CacheEntry = {
  url: string        // ObjectURL
  lastHit: number    // para LRU
  refs: number       // refcount si lo usas en múltiples lugares
}

const cache = new Map<string, CacheEntry>()
const MAX_CACHE_ITEMS = 150 // ajusta según tu lista

async function fetchBlob(path: string): Promise<Blob> {
  const res = await apiFetch(path, { headers: { Accept: '*/*' } })
  return res.blob()
}

function touch(path: string) {
  const it = cache.get(path)
  if (it) {
    it.lastHit = Date.now()
    cache.set(path, it)
  }
}

function evictLRU() {
  if (cache.size <= MAX_CACHE_ITEMS) return
  // Saca solo entradas sin refs (no visibles) y más antiguas
  const candidates: Array<[string, CacheEntry]> = []
  cache.forEach((v, k) => { if (v.refs <= 0) candidates.push([k, v]) })
  candidates.sort((a, b) => a[1].lastHit - b[1].lastHit)
  const toRemove = Math.max(0, cache.size - MAX_CACHE_ITEMS)
  for (let i = 0; i < toRemove && i < candidates.length; i++) {
    const [path, entry] = candidates[i]
    URL.revokeObjectURL(entry.url)
    cache.delete(path)
  }
}

/** Pide una imagen autenticada y devuelve un ObjectURL, con caché. */
export async function acquireAuthImageURL(path: string): Promise<string> {
  const hit = cache.get(path)
  if (hit) {
    hit.refs++
    touch(path)
    return hit.url
  }
  const blob = await fetchBlob(path)
  const url = URL.createObjectURL(blob)
  cache.set(path, { url, refs: 1, lastHit: Date.now() })
  evictLRU()
  return url
}

/** Libera una referencia; si refs llega a 0, se mantiene en caché por si se reutiliza. */
export function releaseAuthImageURL(path: string) {
  const it = cache.get(path)
  if (!it) return
  it.refs = Math.max(0, it.refs - 1)
  touch(path)
  // No se revoca de inmediato para permitir scroll ida/vuelta; LRU lo limpiará.
}

/** Limpia totalmente del caché (opcional si quieres invalidar). */
export function invalidateAuthImage(path: string) {
  const it = cache.get(path)
  if (!it) return
  URL.revokeObjectURL(it.url)
  cache.delete(path)
}