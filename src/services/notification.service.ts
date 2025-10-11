import { getJSON, sendJSON } from '@/services/api';
import type { LaravelPage } from '@/types/pagination';
import type { ApiNotification, NotificationsPage, NotificationPayload, NotificationType } from '@/types/notifications';
import { mapNotificationFromApi, mapNotificationsFromApi } from '@/mappers/notification.mapper';

const BASE = '/notifications';

export async function listNotifications(params?: {
    page?: number;
    perPage?: number;
    unreadOnly?: boolean;
    type?: NotificationType;
}): Promise<NotificationsPage> {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.perPage) q.set('per_page', String(params.perPage));
    if (params?.unreadOnly) q.set('unread_only', 'true');
    if (params?.type) q.set('type', params.type);

    const url = q.toString() ? `${BASE}?${q.toString()}` : BASE;
    const res = await getJSON<LaravelPage<ApiNotification>>(url);
    return mapNotificationsFromApi(res);
}

export async function getNotification(id: number) {
    const res = await getJSON<ApiNotification>(`${BASE}/${id}`);
    return mapNotificationFromApi(res);
}

export async function createNotification(input: {
    userId: number;
    type: NotificationType;
    payload: NotificationPayload;
}) {
    const res = await sendJSON<ApiNotification>(BASE, 'POST', {
        user_id: input.userId,
        type: input.type,
        payload_json: input.payload,
    });
    return mapNotificationFromApi(res);
}

export async function markAsRead(id: number) {
    await sendJSON(`${BASE}/${id}/read`, 'POST');
    return true;
}

export async function markAllAsRead() {
    await sendJSON(`${BASE}/read-all`, 'POST', {});
    return true;
}

export async function deleteNotification(id: number) {
    await sendJSON(`${BASE}/${id}`, 'DELETE');
    return true;
}

export async function getBadge(): Promise<number> {
    const res = await getJSON<{ unread: number }>(`${BASE}/badge`);
    return res.unread ?? 0;
}
