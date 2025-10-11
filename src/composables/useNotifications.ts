import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type { Notification, NotificationPayload, NotificationType, NotificationsPage } from '@/types/notifications';
import {
    listNotifications,
    getNotification,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getBadge,
} from '@/services/notification.service';

export function useNotifications(options?: {
    autoFetchList?: boolean;
    autoFetchBadge?: boolean;
    badgePollMs?: number; // p. ej. 15_000
}) {
    const loading = ref(false);
    const items = ref<Notification[]>([]);
    const page = ref(1);
    const perPage = ref(10);
    const total = ref(0);
    const lastPage = ref(1);
    const hasNext = ref(false);
    const hasPrev = ref(false);

    const unreadOnly = ref(false);
    const filterType = ref<NotificationType | ''>('');

    const badge = ref(0);
    let badgeTimer: number | null = null;

    const unreadCount = computed(() => items.value.filter(n => !n.isRead).length);

    async function fetchList(p?: { page?: number; perPage?: number }) {
        loading.value = true;
        try {
            const res: NotificationsPage = await listNotifications({
                page: p?.page ?? page.value,
                perPage: p?.perPage ?? perPage.value,
                unreadOnly: unreadOnly.value,
                type: filterType.value || undefined,
            });
            items.value = res.items;
            page.value = res.page;
            perPage.value = res.perPage;
            total.value = res.total;
            lastPage.value = res.lastPage;
            hasNext.value = res.hasNext;
            hasPrev.value = res.hasPrev;
        } finally {
            loading.value = false;
        }
    }

    async function fetchBadge() {
        badge.value = await getBadge();
    }

    function startBadgePolling() {
        stopBadgePolling();
        const interval = options?.badgePollMs ?? 15000;
        badgeTimer = window.setInterval(fetchBadge, interval);
    }

    function stopBadgePolling() {
        if (badgeTimer) {
            clearInterval(badgeTimer);
            badgeTimer = null;
        }
    }

    async function fetchOne(id: number) {
        return await getNotification(id);
    }

    async function addNotification(input: { userId: number; type: NotificationType; payload: NotificationPayload }) {
        const created = await createNotification(input);
        // Opcional: prepende si coincide con filtros actuales
        if ((!unreadOnly.value || !created.isRead) && (!filterType.value || filterType.value === created.type)) {
            items.value = [created, ...items.value];
            total.value += 1;
        }
        await fetchBadge();
        return created;
    }

    async function setRead(id: number) {
        const ok = await markAsRead(id);
        if (ok) {
            const idx = items.value.findIndex(n => n.id === id);
            if (idx >= 0 && !items.value[idx].isRead) {
                items.value[idx] = { ...items.value[idx], isRead: true };
            }
            await fetchBadge();
        }
    }

    async function setAllRead() {
        const ok = await markAllAsRead();
        if (ok) {
            items.value = items.value.map(n => ({ ...n, isRead: true }));
            await fetchBadge();
        }
    }

    async function removeNotification(id: number) {
        const ok = await deleteNotification(id);
        if (ok) {
            items.value = items.value.filter(n => n.id !== id);
            total.value = Math.max(0, total.value - 1);
            await fetchBadge();
        }
    }

    function setFilters(opts: { unreadOnly?: boolean; type?: NotificationType | '' }) {
        if (typeof opts.unreadOnly === 'boolean') unreadOnly.value = opts.unreadOnly;
        if (typeof opts.type !== 'undefined') filterType.value = opts.type;
        page.value = 1;
        return fetchList();
    }

    onMounted(async () => {
        if (options?.autoFetchList) {
            await fetchList();
        }
        if (options?.autoFetchBadge) {
            await fetchBadge();
            startBadgePolling();
        }
    });

    onBeforeUnmount(() => {
        stopBadgePolling();
    });

    return {
        // state
        loading,
        items,
        page,
        perPage,
        total,
        lastPage,
        hasNext,
        hasPrev,
        unreadOnly,
        filterType,
        badge,
        unreadCount,

        // actions
        fetchList,
        fetchOne,
        addNotification,
        setRead,
        setAllRead,
        removeNotification,
        setFilters,

        // badge polling
        fetchBadge,
        startBadgePolling,
        stopBadgePolling,
    };
}
