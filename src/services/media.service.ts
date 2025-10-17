import { getJSON, sendJSON } from '@/services/api'
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

// Helpers: construir FormData para multipart
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
    } else if (v instanceof File) {
      fd.append(k, v)
    } else {
      fd.append(k, String(v))
    }
  }
  return fd
}

// Nota: para multipart, no uses sendJSON; usa fetch nativo o crea un helper sendForm
async function sendForm<T>(url: string, method: 'POST' | 'PUT' | 'PATCH', form: FormData): Promise<T> {
  const res = await fetch(url, {
    method,
    body: form,
    // OJO: NO pongas Content-Type manual (el navegador lo setea con boundary)
    credentials: 'include',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function createMedia(payload: CreateMediaDTO): Promise<MediaItem> {
  const form = buildFormData(payload as any)
  const dto = await sendForm<ApiMediaItem>(BASE, 'POST', form)
  return mapMediaFromApi(dto)
}

export async function updateMedia(id: number, payload: UpdateMediaDTO): Promise<MediaItem> {
  const form = buildFormData(payload as any)
  const dto = await sendForm<ApiMediaItem>(`${BASE}/${id}`, 'PUT', form)
  return mapMediaFromApi(dto)
}

export async function deleteMedia(id: number): Promise<void> {
  await sendJSON<void>(`${BASE}/${id}`, 'DELETE')
}

// URLs de utilidad (thumbnail y descarga segura)
export function mediaThumbnailUrl(id: number, size: 'sm' | 'md' | 'lg' = 'sm'): string {
  return `${BASE}/${id}/thumbnail?size=${size}`
}

export function mediaDownloadUrl(id: number): string {
  return `${BASE}/${id}/download`
}
