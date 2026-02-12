import { ref, computed } from "vue";
import type { ThreadModel, MessageModel, PaginatedMessages } from "@/types/threads";
import { getThreadService, postMessageService, markThreadReadService } from "@/services/threads.service";
import { mapThreadDTO, mapPaginatedMessagesDTO, mapMessageDTO } from "@/mappers/threads.mapper";

export function useThread(threadId: number, initialPerPage = 30) {
  const thread = ref<ThreadModel | null>(null);
  const messages = ref<MessageModel[]>([]);
  const pageMeta = ref<PaginatedMessages | null>(null);

  const loading = ref(false);
  const sending = ref(false);
  const marking = ref(false);
  const error = ref<string | null>(null);

  const currentPage = computed(() => pageMeta.value?.current_page ?? 1);
  const lastPage = computed(() => pageMeta.value?.last_page ?? 1);
  const hasNext = computed(() => (pageMeta.value?.next_page_url ?? null) !== null);
  const perPage = ref(initialPerPage);

  async function fetchThread(page?: number) {
    loading.value = true;
    error.value = null;
    try {
      const res = await getThreadService(threadId, { per_page: perPage.value, page });
      thread.value = mapThreadDTO(res.thread);
      const mapped = mapPaginatedMessagesDTO(res.messages);
      pageMeta.value = mapped;
      messages.value = mapped.data; // reemplaza (primer carga o cambio de página)
    } catch (e: any) {
      error.value = e?.message ?? "Error al cargar el hilo";
    } finally {
      loading.value = false;
    }
  }

  async function loadNext() {
    if (!hasNext.value) return;
    const next = (pageMeta.value?.current_page ?? 1) + 1;
    try {
      const res = await getThreadService(threadId, { per_page: perPage.value, page: next });
      const mapped = mapPaginatedMessagesDTO(res.messages);
      pageMeta.value = mapped;
      // concatenamos mensajes (evita duplicados por si el backend repite límites)
      const known = new Set(messages.value.map(m => m.id));
      const toAdd = mapped.data.filter(m => !known.has(m.id));
      messages.value = messages.value.concat(toAdd);
    } catch (e: any) {
      // opcional: mantener error silencioso
    }
  }

  async function sendMessage(bodyMd: string) {
    if (!bodyMd?.trim()) return;
    sending.value = true;
    error.value = null;
    try {
      const dto = await postMessageService(threadId, bodyMd);
      const msg = mapMessageDTO(dto);
      messages.value = messages.value.concat(msg);
      // actualiza meta (to/total podrían variar si lo usas)
      // opcional: hacer scroll al final en la UI
      return msg;
    } catch (e: any) {
      error.value = e?.message ?? "No se pudo enviar el mensaje";
      throw e;
    } finally {
      sending.value = false;
    }
  }

  async function markRead() {
    marking.value = true;
    try {
      await markThreadReadService(threadId);
    } finally {
      marking.value = false;
    }
  }

  return {
    // state
    thread,
    messages,
    pageMeta,
    loading,
    sending,
    marking,
    error,
    currentPage,
    lastPage,
    hasNext,
    perPage,
    // actions
    fetchThread,
    loadNext,
    sendMessage,
    markRead,
  };
}
