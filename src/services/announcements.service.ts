import { getJSON, sendJSON } from '@/services/api'
import {
    mapAnnouncementFromApi,
    mapAnnouncementsFromApi,
    type ApiAnnouncement,
} from '@/mappers/announcement.mapper'
import type {
    Announcement,
    AnnouncementVisibility,
    CreateAnnouncementDTO,
    UpdateAnnouncementDTO,
} from '@/types/announcements'
import type { LaravelPage } from '@/types/pagination'

const BASE = '/announcements'

export type AnnouncementsPage = {
    items: Announcement[]
    page: number
    perPage: number
    total: number
    lastPage: number
    hasNext: boolean
    hasPrev: boolean
}

export async function listAnnouncements(params?: {
    page?: number
    perPage?: number
    search?: string
    visibility?: AnnouncementVisibility
    archived?: boolean
    published?: boolean
    groupId?: number
    userId?: number
    sort?: string
    direction?: 'asc' | 'desc'
}): Promise<AnnouncementsPage> {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.perPage) q.set('per_page', String(params.perPage))
    if (params?.search) q.set('q', params.search)
    if (params?.visibility) q.set('visibility', params.visibility)
    if (typeof params?.archived === 'boolean') q.set('archived', params.archived ? '1' : '0')
    if (typeof params?.published === 'boolean') q.set('published', params.published ? '1' : '0')
    if (params?.groupId) q.set('group_id', String(params.groupId))
    if (params?.userId) q.set('user_id', String(params.userId))
    if (params?.sort) q.set('sort', params.sort)
    if (params?.direction) q.set('direction', params.direction)

    const url = q.toString() ? `${BASE}?${q}` : BASE

    // Respuesta tipo Laravel paginator
    const page = await getJSON<LaravelPage<ApiAnnouncement>>(url)

    return {
        items: mapAnnouncementsFromApi(page.data),
        page: page.current_page,
        perPage: page.per_page,
        total: page.total,
        lastPage: page.last_page,
        hasNext: !!page.next_page_url,
        hasPrev: !!page.prev_page_url,
    }
}

export async function getAnnouncement(id: number): Promise<Announcement> {
    const dto = await getJSON<ApiAnnouncement>(`${BASE}/${id}`)
    return mapAnnouncementFromApi(dto)
}

export async function createAnnouncement(payload: CreateAnnouncementDTO): Promise<Announcement> {
    console.log(payload)
    const dto = await sendJSON<ApiAnnouncement>(BASE, 'POST', payload)
    return mapAnnouncementFromApi(dto)
}

export async function updateAnnouncement(id: number, payload: UpdateAnnouncementDTO): Promise<Announcement> {
    const dto = await sendJSON<ApiAnnouncement>(`${BASE}/${id}`, 'PUT', payload)
    return mapAnnouncementFromApi(dto)
}

export async function deleteAnnouncement(id: number): Promise<void> {
    await sendJSON<void>(`${BASE}/${id}`, 'DELETE')
}
