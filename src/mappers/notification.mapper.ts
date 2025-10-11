import type { LaravelPage } from '@/types/pagination';
import type { ApiNotification, Notification, NotificationsPage } from '@/types/notifications';

export function mapNotificationFromApi(api: ApiNotification): Notification {
    return {
        id: api.id,
        userId: api.user_id,
        type: api.type,
        payload: api.payload_json ?? {},
        isRead: Boolean(api.is_read),
        createdAt: new Date(api.created_at),
    };
}

export function mapNotificationsFromApi(page: LaravelPage<ApiNotification>): NotificationsPage {
    return {
        items: page.data.map(mapNotificationFromApi),
        page: page.current_page,
        perPage: page.per_page,
        total: page.total,
        lastPage: page.last_page,
        hasNext: page.current_page < page.last_page,
        hasPrev: page.current_page > 1,
    };
}
