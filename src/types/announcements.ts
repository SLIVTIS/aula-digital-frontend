export type ISODateTime = string
export type AnnouncementVisibility = 'all' | 'groups' | 'users'

// Autor mínimo (lista) o completo (detalle)
export interface AuthorSummary {
  id: number
  name: string
  email?: string | null
  role?: string
  avatar_path?: string | null
}

export interface GroupSummary {
  id: number
  name: string
  grade: number
  section: string
  code: string
}

export interface UserSummary {
  id: number
  name: string
  avatar_path?: string | null
}

export type AnnouncementTargetType = 'group' | 'user'

export interface AnnouncementTarget {
  id: number
  announcement_id: number
  target_type: AnnouncementTargetType
  group: GroupSummary | null
  user: UserSummary | null
}

export interface AnnouncementRead {
  announcement_id: number
  user_id: number
  read_at: ISODateTime
}

export interface Announcement {
  id: number
  title: string
  body_md: string
  author_user_id: number
  visibility: AnnouncementVisibility
  published_at: ISODateTime | null
  is_archived: boolean
  created_at: ISODateTime
  updated_at: ISODateTime

  //autor “flexible” para lista/detalle
  author: AuthorSummary
  targets: AnnouncementTarget[]
  reads: AnnouncementRead[]
}

export interface CreateAnnouncementDTO {
  title: string
  body_md: string
  visibility: AnnouncementVisibility
  post: boolean
  targets?: Array<
    { target_type: 'group'; group_id: number } | { target_type: 'user'; user_id: number }
  >
}

export interface UpdateAnnouncementDTO {
  title?: string
  body_md?: string
  visibility?: AnnouncementVisibility
  published_at?: ISODateTime | null
  is_archived?: boolean
  targets?: Array<
    { target_type: 'group'; group_id: number } | { target_type: 'user'; user_id: number }
  >
}
