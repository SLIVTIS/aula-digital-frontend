import { apiFetch, getJSON, sendJSON } from '@/services/api'
import type { LaravelPage } from '@/types/pagination'
import type {
  MediaItem,
  MediaScope,
  CreateMediaDTO,
  UpdateMediaDTO,
} from '@/types/media'
import {
  mapMediaFromApi,
  mapMediasFromApi,
  type ApiMediaItem,
} from '@/mappers/media.mapper'

const BASE = '/media'
const API_BASE = import.meta.env.VITE_API_BASE_URL as string

// Page shape (como tu ejemplo de announcements)
export type MediaPage = {
  items: MediaItem[]
  page: number
  perPage: number
  total: number
  lastPage: number
  hasNext: boolean
  hasPrev: boolean
}

export async function listMedia(params?: {
  page?: number
  perPage?: number
  search?: string
  scope?: MediaScope
  groupId?: number
  userId?: number
  sort?: string
  direction?: 'asc' | 'desc'
}): Promise<MediaPage> {
  const q = new URLSearchParams()
  if (params?.page) q.set('page', String(params.page))
  if (params?.perPage) q.set('per_page', String(params.perPage))
  if (params?.search) q.set('search', params.search) // en tu controlador usé 'search'
  if (params?.scope) q.set('scope', params.scope)
  if (params?.groupId) q.set('group_id', String(params.groupId))
  if (params?.userId) q.set('user_id', String(params.userId))
  if (params?.sort) q.set('sort', params.sort)
  if (params?.direction) q.set('direction', params.direction)

  const url = q.toString() ? `${BASE}?${q}` : BASE
  const page = await getJSON<LaravelPage<ApiMediaItem>>(url)

  return {
    items: mapMediasFromApi(page.data),
    page: page.current_page,
    perPage: page.per_page,
    total: page.total,
    lastPage: page.last_page,
    hasNext: !!page.next_page_url,
    hasPrev: !!page.prev_page_url,
  }
}

export async function getMedia(id: number): Promise<MediaItem> {
  const dto = await getJSON<ApiMediaItem>(`${BASE}/${id}`)
  return mapMediaFromApi(dto)
}

// -----------------------------
// Helpers multipart/form-data
// -----------------------------

// Construir FormData desde tus DTOs (envío tipo targets[0][...] para Laravel)
function buildFormData(data: Record<string, any>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue

    if (k === 'targets' && Array.isArray(v)) {
      v.forEach((t, i) => {
        fd.append(`targets[${i}][target_type]`, t.target_type)
        if (t.target_type === 'group') {
          fd.append(`targets[${i}][group_id]`, String(t.group_id))
        } else {
          fd.append(`targets[${i}][user_id]`, String(t.user_id))
        }
      })
      continue
    }

    if (v instanceof File) {
      fd.append(k, v)
      continue
    }

    // null/empty string se envían como '' para evitar "null" string
    fd.append(k, v == null ? '' : String(v))
  }
  return fd
}

// Usa TU apiFetch (respeta Bearer/Accept y BASE_URL)
async function sendForm<T>(path: string, method: 'POST' | 'PUT' | 'PATCH', form: FormData): Promise<T> {
  const res = await apiFetch(path, { method, body: form })
  return res.json() as Promise<T>
}

// -----------------------------
// CRUD
// -----------------------------
export async function createMedia(payload: CreateMediaDTO): Promise<MediaItem> {
  const form = buildFormData(payload as any)
  const dto = await sendForm<ApiMediaItem>(BASE, 'POST', form)
  return mapMediaFromApi(dto)
}

export async function updateMedia(id: number, payload: UpdateMediaDTO): Promise<MediaItem> {
  const form = buildFormData(payload as any)
  // Usa PUT; si prefieres PATCH, cambia método y tu ruta
  const dto = await sendForm<ApiMediaItem>(`${BASE}/${id}`, 'PUT', form)
  return mapMediaFromApi(dto)
}

export async function deleteMedia(id: number): Promise<void> {
  await sendJSON<void>(`${BASE}/${id}`, 'DELETE')
}

// -----------------------------
// Subida con progreso (opcional)
// -----------------------------
// Devuelve { promise, cancel } para mostrar % y poder abortar
import { useAuthStore } from '@/stores/auth'

export function createMediaWithProgress(
  payload: CreateMediaDTO,
  onProgress?: (percent: number) => void
): { promise: Promise<MediaItem>; cancel: () => void } {
  const form = buildFormData(payload as any)
  const xhr = new XMLHttpRequest()

  const promise = new Promise<MediaItem>((resolve, reject) => {
    // Token igual que apiFetch: Pinia -> localStorage
    let token = ''
    try { token = useAuthStore().token || '' } catch { }
    if (!token) token = localStorage.getItem('token') || ''

    xhr.open('POST', `${API_BASE}${BASE}`, true)
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('Accept', 'application/json')

    xhr.upload.onprogress = (e) => {
      if (!onProgress) return
      if (e.lengthComputable) onProgress(Math.round((e.loaded * 100) / e.total))
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const dto = JSON.parse(xhr.responseText) as ApiMediaItem
          resolve(mapMediaFromApi(dto))
        } catch (err) {
          reject(err)
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
      }
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.onabort = () => reject(new Error('Upload aborted'))

    xhr.send(form)
  })

  return { promise, cancel: () => xhr.abort() }
}

export function updateMediaWithProgress(
  id: number,
  payload: UpdateMediaDTO,
  onProgress?: (percent: number) => void
): { promise: Promise<MediaItem>; cancel: () => void } {
  const form = buildFormData(payload as any)
  const xhr = new XMLHttpRequest()

  const promise = new Promise<MediaItem>((resolve, reject) => {
    let token = ''
    try { token = useAuthStore().token || '' } catch { }
    if (!token) token = localStorage.getItem('token') || ''

    xhr.open('PUT', `${API_BASE}${BASE}/${id}`, true)
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('Accept', 'application/json')

    xhr.upload.onprogress = (e) => {
      if (!onProgress) return
      if (e.lengthComputable) onProgress(Math.round((e.loaded * 100) / e.total))
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const dto = JSON.parse(xhr.responseText) as ApiMediaItem
          resolve(mapMediaFromApi(dto))
        } catch (err) {
          reject(err)
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
      }
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.onabort = () => reject(new Error('Upload aborted'))

    xhr.send(form)
  })

  return { promise, cancel: () => xhr.abort() }
}

// -----------------------------
// URLs de utilidad
// -----------------------------
export function mediaThumbnailUrl(id: number, size: 'sm' | 'md' | 'lg' = 'sm'): string {
  // ruta relativa (útil si la compones con API_BASE en tu img)
  return `${BASE}/${id}/thumbnail?size=${size}`
}

export function mediaThumbnailSrc(id: number, size: 'sm' | 'md' | 'lg' = 'sm'): string {
  // URL absoluta lista para usar en <img :src="...">
  return `${API_BASE}${mediaThumbnailUrl(id, size)}`
}

export function mediaDownloadUrl(id: number): string {
  return `${BASE}/${id}/download`
}

export function mediaDownloadSrc(id: number): string {
  return `${API_BASE}${mediaDownloadUrl(id)}`
}
