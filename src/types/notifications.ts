export type ISODateTime = string;

export type NotificationType =
    | 'announcement.published'
    | 'message.received'
    | (string & {});

export interface NotificationPayloadAnnouncement {
    announcement_id: number;
    title: string;
    excerpt?: string | null;
    deep_link?: string | null;
}

export interface NotificationPayloadMessage {
    message_id: number;
    from_user_id: number;
    preview?: string | null;
    deep_link?: string | null;
}

export type NotificationPayload =
    | NotificationPayloadAnnouncement
    | NotificationPayloadMessage
    | Record<string, unknown>;

export interface ApiNotification {
    id: number;
    user_id: number;
    type: NotificationType;
    payload_json: NotificationPayload;
    is_read: boolean;
    created_at: ISODateTime;
}

export interface Notification {
    id: number;
    userId: number;
    type: NotificationType;
    payload: NotificationPayload;
    isRead: boolean;
    createdAt: Date;
}

// Página ya mapeada (modelo frontend)
export type NotificationsPage = {
    items: Notification[];
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
    hasNext: boolean;
    hasPrev: boolean;
};
