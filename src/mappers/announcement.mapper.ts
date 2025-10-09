import type {
  Announcement,
  AnnouncementRead,
  AnnouncementTarget,
  AnnouncementVisibility,
  AuthorSummary,
  GroupSummary,
  UserSummary
} from '@/types/announcements'

// ---- Tipos crudos de API ----
type ApiAuthorBase = { id: number; name: string }

type ApiAuthorExtra = {
  name: string
  email: string | null
  role: string
  avatar_path: string | null
}
export type ApiAuthor = ApiAuthorBase & Partial<ApiAuthorExtra>

export type ApiAnnouncementTargetType = 'group' | 'user'

export interface ApiAnnouncementTarget {
  id: number
  announcement_id: number
  target_type: ApiAnnouncementTargetType
  group: GroupSummary | null
  user: UserSummary | null
}

export interface ApiAnnouncementRead {
  announcement_id: number
  user_id: number
  read_at: string
}

export interface ApiAnnouncement {
  id: number
  title: string
  body_md: string
  author_user_id: number
  visibility: AnnouncementVisibility
  published_at: string | null
  is_archived: boolean
  created_at: string
  updated_at: string
  author: ApiAuthor // <— puede venir mínimo o completo
  targets: ApiAnnouncementTarget[] | null | undefined
  reads: ApiAnnouncementRead[] | null | undefined
}

// ---- Mappers por entidad ----
export function mapAuthorFromApi(a: ApiAuthor): AuthorSummary {
  return {
    id: a.id,
    name: a.name,
    email: a.email ?? undefined,
    role: a.role ?? undefined,
    avatar_path: a.avatar_path ?? undefined
  }
}

export function mapTargetFromApi(t: ApiAnnouncementTarget): AnnouncementTarget {
  return {
    id: t.id,
    announcement_id: t.announcement_id,
    target_type: t.target_type,
    group: t.group ?? null,
    user: t.user ?? null
  }
}

export function mapReadFromApi(r: ApiAnnouncementRead): AnnouncementRead {
  return {
    announcement_id: r.announcement_id,
    user_id: r.user_id,
    read_at: r.read_at
  }
}

export function mapAnnouncementFromApi(a: ApiAnnouncement): Announcement {
  return {
    id: a.id,
    title: a.title,
    body_md: a.body_md,
    author_user_id: a.author_user_id,
    visibility: a.visibility,
    published_at: a.published_at ?? null,
    is_archived: !!a.is_archived,
    created_at: a.created_at,
    updated_at: a.updated_at,
    author: mapAuthorFromApi(a.author), // <— clave
    targets: Array.isArray(a.targets) ? a.targets.map(mapTargetFromApi) : [],
    reads: Array.isArray(a.reads) ? a.reads.map(mapReadFromApi) : []
  }
}

export function mapAnnouncementsFromApi(arr: ApiAnnouncement[]): Announcement[] {
  return arr.map(mapAnnouncementFromApi)
}

// (Opcional) paginación Laravel genérica si la usas en otras partes
export interface ApiPaginated<T> {
  data: T[]
  meta?: {
    current_page?: number
    last_page?: number
    per_page?: number
    total?: number
  }
  links?: unknown
}
