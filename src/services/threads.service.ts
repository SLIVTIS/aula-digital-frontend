import { getJSON, sendJSON } from "@/services/api";
import type {
  ThreadShowResponseDTO,
  MessageDTO,
  MarkReadResponseDTO,
  ThreadIndexResponseDTO,
  UnreadSummaryResponseDTO,
  UnreadCountDTO
} from "@/types/threads";

export async function getThreadService(threadId: number, params?: { per_page?: number; page?: number }) {
  const qp = new URLSearchParams();
  if (params?.per_page) qp.set("per_page", String(params.per_page));
  if (params?.page) qp.set("page", String(params.page));
  const suffix = qp.toString() ? `?${qp.toString()}` : "";
  return getJSON<ThreadShowResponseDTO>(`/threads/${threadId}${suffix}`);
}

export async function postMessageService(threadId: number, body_md: string) {
  return sendJSON<MessageDTO>(`/threads/${threadId}/messages`, "POST", { body_md });
}

export async function markThreadReadService(threadId: number) {
  return sendJSON<MarkReadResponseDTO>(`/threads/${threadId}/read`, "POST");
}

/** Lista de hilos (paginada) */
export async function listThreadsService(params?: { page?: number; per_page?: number; q?: string }) {
  const qp = new URLSearchParams();
  if (params?.page) qp.set("page", String(params.page));
  if (params?.per_page) qp.set("per_page", String(params.per_page));
  if (params?.q) qp.set("q", params.q);
  const suffix = qp.toString() ? `?${qp.toString()}` : "";
  return getJSON<ThreadIndexResponseDTO>(`/threads${suffix}`);
}

/** Resumen de no leídos por hilo del usuario autenticado */
export async function getUnreadSummaryService(params?: { thread_id?: number }) {
  const qp = new URLSearchParams();
  if (params?.thread_id) qp.set("thread_id", String(params.thread_id));
  const suffix = qp.toString() ? `?${qp.toString()}` : "";
  return getJSON<UnreadSummaryResponseDTO>(`/threads/unread${suffix}`);
}

export async function getUnreadCountService() {
  return getJSON<UnreadCountDTO>("/threads/unread/count");
}

