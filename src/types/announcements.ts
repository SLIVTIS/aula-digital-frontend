export type ISODateTime = string;
export type AnnouncementVisibility = 'all' | 'groups' | 'users';

// Autor mínimo (lista) o completo (detalle)
export interface AuthorSummary {
    id: number;
    name: string;
    email?: string | null;
    email_verified_at?: ISODateTime | null;
    role_id?: number;
    avatar_path?: string | null;
    avatar_updated_at?: ISODateTime | null;
    created_at?: ISODateTime;
    updated_at?: ISODateTime;
}

export type AnnouncementTargetType = 'group' | 'user';

export interface AnnouncementTarget {
    id: number;
    announcement_id: number;
    target_type: AnnouncementTargetType;
    group_id: number | null;
    user_id: number | null;
}

export interface AnnouncementRead {
    announcement_id: number;
    user_id: number;
    read_at: ISODateTime;
}

export interface Announcement {
    id: number;
    title: string;
    body_md: string;
    author_user_id: number;
    visibility: AnnouncementVisibility;
    published_at: ISODateTime | null;
    is_archived: boolean;
    created_at: ISODateTime;
    updated_at: ISODateTime;

    // AHORA: autor “flexible” para lista/detalle
    author: AuthorSummary;
    targets: AnnouncementTarget[];
    reads: AnnouncementRead[];
}

export interface CreateAnnouncementDTO {
    title: string;
    body_md: string;
    visibility: AnnouncementVisibility;
    published_at?: ISODateTime | null;
    is_archived?: boolean;
    targets?: Array<
        | { target_type: 'group'; group_id: number }
        | { target_type: 'user'; user_id: number }
    >;
}

export interface UpdateAnnouncementDTO {
    title?: string;
    body_md?: string;
    visibility?: AnnouncementVisibility;
    published_at?: ISODateTime | null;
    is_archived?: boolean;
    targets?: Array<
        | { target_type: 'group'; group_id: number }
        | { target_type: 'user'; user_id: number }
    >;
}
