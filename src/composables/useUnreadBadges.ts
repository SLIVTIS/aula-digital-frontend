import { ref } from "vue";
import { getUnreadSummaryService } from "@/services/threads.service";
import { mapUnreadSummaryDTO } from "@/mappers/threads.mapper";
import type { ThreadPreview } from "@/types/threads";

export function useUnreadBadges(currentUserId?: number) {
    const totalUnread = ref(0);
    // threadId -> count
    const byThread = ref<Map<number, number>>(new Map());

    async function fetchUnread(threadId?: number) {
        const res = await getUnreadSummaryService(threadId ? { thread_id: threadId } : undefined);
        const map = new Map<number, number>();
        for (const row of res.data) {
            const m = mapUnreadSummaryDTO(row);
            map.set(m.threadId, m.unreadCount);
        }
        byThread.value = map;
        totalUnread.value = res.total ?? 0;
    }

    /** Fusiona los no leídos dentro de la colección de hilos de la UI */
    function applyToThreadsList(threads: ThreadPreview[]) {
        const map = byThread.value;
        threads.forEach(t => {
            t.unreadCount = map.get(t.id) ?? 0;
        });
    }

    /** Cuando el usuario abrió un hilo y marcaste leídos en backend */
    function onMarkedRead(threadId: number) {
        const map = new Map(byThread.value);
        const prev = map.get(threadId) ?? 0;
        if (prev > 0) {
            totalUnread.value = Math.max(0, totalUnread.value - prev);
        }
        map.set(threadId, 0);
        byThread.value = map;
    }

    /** Cuando llega un mensaje nuevo (vía websocket/polling) */
    function onIncomingMessage(threadId: number, senderUserId: number, createdAt: Date | string) {
        // si yo soy el emisor, no cuenta como no leído
        if (currentUserId && senderUserId === currentUserId) return;

        const map = new Map(byThread.value);
        const next = (map.get(threadId) ?? 0) + 1;
        map.set(threadId, next);
        byThread.value = map;
        totalUnread.value += 1;
    }

    return {
        totalUnread,
        byThread,
        fetchUnread,
        applyToThreadsList,
        onMarkedRead,
        onIncomingMessage,
    };
}
