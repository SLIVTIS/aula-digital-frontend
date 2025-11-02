// src/composables/useThreadsList.ts
import { ref, computed } from "vue";
import type { ThreadPreview, MessageModel } from "@/types/threads";
import type { LaravelPage } from "@/types/pagination";
import { listThreadsService } from "@/services/threads.service";
import { mapThreadListItemDTO, mapPaginatedDTO } from "@/mappers/threads.mapper";

export interface UseThreadsOptions {
  perPage?: number;
  /** Si tienes el id del usuario actual en frontend, úsalo para reglas de no leídos */
  currentUserId?: number;
  /** si quieres inicio con q por default*/
  initialQuery?: string;
}

export function useThreadsList(opts: UseThreadsOptions = {}) {
  const perPage = ref(opts.perPage ?? 20);
  const q = ref<string>(opts.initialQuery ?? "");

  const threads = ref<ThreadPreview[]>([]);
  const pageMeta = ref<Pick<LaravelPage<any>, "current_page" | "last_page" | "next_page_url" | "prev_page_url" | "total" | "per_page"> | null>(null);

  const loading = ref(false);
  const loadingMore = ref(false);
  const error = ref<string | null>(null);

  const currentPage = computed(() => pageMeta.value?.current_page ?? 1);
  const lastPage = computed(() => pageMeta.value?.last_page ?? 1);
  const hasNext = computed(() => (pageMeta.value?.next_page_url ?? null) !== null);

  async function fetchList(page = 1) {
    loading.value = true;
    error.value = null;
    try {
      const dto = await listThreadsService({ page, per_page: perPage.value, q: q.value || undefined });
      const mapped = mapPaginatedDTO(dto, mapThreadListItemDTO);
      pageMeta.value = {
        current_page: mapped.current_page,
        last_page: mapped.last_page,
        next_page_url: mapped.next_page_url,
        prev_page_url: mapped.prev_page_url,
        total: mapped.total,
        per_page: mapped.per_page,
      };
      threads.value = mapped.data;
    } catch (e: any) {
      error.value = e?.message ?? "No se pudo cargar la lista de hilos";
    } finally {
      loading.value = false;
    }
  }

  async function loadNext() {
    if (!hasNext.value) return;
    loadingMore.value = true;
    try {
      const next = (pageMeta.value?.current_page ?? 1) + 1;
      const dto = await listThreadsService({ page: next, per_page: perPage.value, q: q.value || undefined });
      const mapped = mapPaginatedDTO(dto, mapThreadListItemDTO);
      // merge evitando duplicados
      const known = new Set(threads.value.map(t => t.id));
      const toAdd = mapped.data.filter(t => !known.has(t.id));
      threads.value = threads.value.concat(toAdd);
      pageMeta.value = {
        current_page: mapped.current_page,
        last_page: mapped.last_page,
        next_page_url: mapped.next_page_url,
        prev_page_url: mapped.prev_page_url,
        total: mapped.total,
        per_page: mapped.per_page,
      };
    } finally {
      loadingMore.value = false;
    }
  }

  /** Si quieres refrescar un hilo específico sin recargar todo */
  function refreshThreadInList(updated: ThreadPreview) {
    const idx = threads.value.findIndex(t => t.id === updated.id);
    if (idx >= 0) threads.value[idx] = updated;
  }

  /** Optimista: cuando llega un nuevo mensaje (por websocket) actualiza el preview */
  function bumpOnNewMessage(threadId: number, message: MessageModel) {
    const idx = threads.value.findIndex(t => t.id === threadId);
    if (idx === -1) return;

    const t = threads.value[idx];
    t.lastMessage = message;
    t.lastMessageAt = message.createdAt;

    // Reglas de no leídos:
    // si el mensaje NO es del usuario actual, incrementa no leídos
    if (opts.currentUserId && message.senderUserId !== opts.currentUserId) {
      t.unreadCount = (t.unreadCount ?? 0) + 1;
    }

    // mover hilo al tope (orden por lastMessageAt DESC)
    threads.value.splice(idx, 1);
    threads.value.unshift(t);
  }

  /** Cuando el usuario abre el hilo y la API marca leídos, sincroniza contador */
  function clearUnread(threadId: number) {
    const t = threads.value.find(x => x.id === threadId);
    if (t) t.unreadCount = 0;
  }

  return {
    // state
    threads,
    pageMeta,
    q,
    perPage,
    loading,
    loadingMore,
    error,
    currentPage,
    lastPage,
    hasNext,
    // actions
    fetchList,
    loadNext,
    refreshThreadInList,
    bumpOnNewMessage,
    clearUnread,
  };
}
