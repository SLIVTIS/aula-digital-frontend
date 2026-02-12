export type ISODateTime = string
export type MediaScope = 'all' | 'groups' | 'users'
export type MediaTargetType = 'group' | 'user'

export interface AuthorSummary {
  id: number
  name: string
  avatar_path?: string | null
}

export interface MediaTarget {
  id: number
  media_id: number
  target_type: MediaTargetType
  group_id: number | null
  user_id: number | null
  // Expandido (en show):
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

export interface MediaDownload {
  id: number
  media_id: number
  user_id: number
  downloaded_at: ISODateTime
  ip_address?: string | null
}

export interface MediaItem {
  id: number
  uploader_user_id: number
  title: string
  description: string | null
  file_path: string
  mime_type: string
  file_size_bytes: number
  checksum_sha256: string | null
  scope: MediaScope
  created_at: ISODateTime
  updated_at: ISODateTime
  uploader?: AuthorSummary
  targets?: MediaTarget[]
  downloads?: MediaDownload[] // en show: últimos N
}

// DTOs para crear/actualizar (multipart)
export interface CreateMediaDTO {
  file: File
  title: string
  description?: string | null
  scope: MediaScope
  targets?: Array<
    | { target_type: 'group'; group_id: number }
    | { target_type: 'user'; user_id: number }
  >
}

export interface UpdateMediaDTO {
  // cualquiera opcional
  file?: File
  title?: string
  description?: string | null
  scope?: MediaScope
  targets?: Array<
    | { target_type: 'group'; group_id: number }
    | { target_type: 'user'; user_id: number }
  >
}
