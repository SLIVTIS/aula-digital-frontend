import { ref } from "vue";
import { getUnreadCountService } from "@/services/threads.service";

export function useUnreadCount(currentUserId?: number) {
    const totalUnread = ref(0);

    async function refreshUnreadCount() {
        const res = await getUnreadCountService();
        totalUnread.value = res.total ?? 0;
    }

    // Útil si, tras abrir un hilo, tu backend marca leídos y
    // sabes cuántos se acaban de marcar.
    function decrementBy(n: number) {
        totalUnread.value = Math.max(0, totalUnread.value - Math.max(0, n));
    }

    // Útil con websockets: si llega un mensaje y NO soy yo,
    // sube el contador global.
    function onIncomingMessage(senderUserId: number) {
        if (!currentUserId || senderUserId === currentUserId) return;
        totalUnread.value += 1;
    }

    return {
        totalUnread,
        refreshUnreadCount,
        decrementBy,
        onIncomingMessage,
    };
}
