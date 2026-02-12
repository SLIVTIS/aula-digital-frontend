import type {
  MediaItem,
  MediaTarget,
  MediaDownload,
} from '@/types/media'

// --- Tipos de API (snake_case) ---
export interface ApiAuthorSummary {
  id: number
  name: string
  avatar_path?: string | null
}

export interface ApiMediaTarget {
  id: number
  media_id: number
  target_type: 'group' | 'user'
  group_id: number | null
  user_id: number | null
  group?: {
    id: number
    name: string
    grade: string | null
    section: string | null
    code: string | null
  } | null
  user?: {
    id: number
    name: string
    avatar_path?: string | null
  } | null
}

export interface ApiMediaDownload {
  id: number
  media_id: number
  user_id: number
  downloaded_at: string
  ip_address?: string | null
}

export interface ApiMediaItem {
  id: number
  uploader_user_id: number
  title: string
  description: string | null
  file_path: string
  mime_type: string
  file_size_bytes: number
  checksum_sha256: string | null
  scope: 'all' | 'groups' | 'users'
  created_at: string
  updated_at: string
  uploader?: ApiAuthorSummary
  targets?: ApiMediaTarget[]
  downloads?: ApiMediaDownload[]
}

// --- Mappers ---
export function mapMediaTargetFromApi(x: ApiMediaTarget): MediaTarget {
  return {
    id: x.id,
    media_id: x.media_id,
    target_type: x.target_type,
    group_id: x.group_id,
    user_id: x.user_id,
    group: x.group ?? null,
    user: x.user ?? null,
  }
}

export function mapMediaDownloadFromApi(x: ApiMediaDownload): MediaDownload {
  return {
    id: x.id,
    media_id: x.media_id,
    user_id: x.user_id,
    downloaded_at: x.downloaded_at,
    ip_address: x.ip_address ?? null,
  }
}

export function mapMediaFromApi(x: ApiMediaItem): MediaItem {
  return {
    id: x.id,
    uploader_user_id: x.uploader_user_id,
    title: x.title,
    description: x.description,
    file_path: x.file_path,
    mime_type: x.mime_type,
    file_size_bytes: x.file_size_bytes,
    checksum_sha256: x.checksum_sha256,
    scope: x.scope,
    created_at: x.created_at,
    updated_at: x.updated_at,
    uploader: x.uploader
      ? {
          id: x.uploader.id,
          name: x.uploader.name,
          avatar_path: x.uploader.avatar_path ?? null,
        }
      : undefined,
    targets: x.targets?.map(mapMediaTargetFromApi),
    downloads: x.downloads?.map(mapMediaDownloadFromApi),
  }
}

export function mapMediasFromApi(items: ApiMediaItem[]): MediaItem[] {
  return items.map(mapMediaFromApi)
}
