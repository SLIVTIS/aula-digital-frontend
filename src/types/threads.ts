import type { LaravelPage } from "@/types/pagination";

// === DTOs tal como vienen del backend ===
export interface UserSummaryDTO {
  id: number;
  name: string;
  role?: { id: number; slug: string; name: string } | null;
  avatar_url?: string | null;
}

export interface UserSummary {
  id: number;
  name: string;
  role?: { id: number; slug: string; name: string } | null;
  avatar?: string | null;
}

export interface ThreadDTO {
  id: number;
  subject: string | null;
  is_one_to_one: boolean;
  participants: UserSummaryDTO[];
  created_at?: string; // por si lo agregas luego
}

export interface MessageDTO {
  id: number;
  thread_id: number;
  sender_user_id: number;
  body_md: string;
  created_at: string;
  sender?: UserSummaryDTO; // el show y storeMessage lo incluyen
}

export interface ThreadShowResponseDTO {
  thread: ThreadDTO;
  messages: LaravelPage<MessageDTO>;
}

export interface MarkReadResponseDTO {
  marked: number;
}

export interface ThreadModel {
  id: number;
  subject: string | null;
  isOneToOne: boolean;
  participants: UserSummary[];
  createdAt?: Date;
}

export interface MessageModel {
  id: number;
  threadId: number;
  senderUserId: number;
  bodyMd: string;
  createdAt: Date;
  sender?: UserSummary;
}

export interface PaginatedMessages extends Omit<LaravelPage<MessageModel>, "data"> {
  data: MessageModel[];
}

export interface MessageDTO {
  id: number;
  thread_id: number;
  sender_user_id: number;
  body_md: string;
  created_at: string;
  sender?: UserSummaryDTO;
}
export interface MessageModel {
  id: number;
  threadId: number;
  senderUserId: number;
  bodyMd: string;
  createdAt: Date;
  sender?: UserSummary;
}

export interface ThreadModel {
  id: number;
  subject: string | null;
  isOneToOne: boolean;
  participants: UserSummary[];
  createdAt?: Date;
}

/** ===== Listado de hilos (preview) =====
 * El index del backend devuelve un paginator de hilos. En cada ítem:
 * - puede traer messages: [last] (por la carga con limit(1)), ó
 * - opcionalmente un campo last_message (si lo agregas en el backend)
 * - y un unread_count si lo calculas (opcional)
 */
export interface ThreadListItemDTO extends ThreadDTO {
  messages?: MessageDTO[];         // normalmente 1 (el último)
  last_message?: MessageDTO | null; // si decides exponerlo directo
  unread_count?: number;            // opcional
}

/** Paginador de hilos (DTO) */
export type ThreadIndexResponseDTO = LaravelPage<ThreadListItemDTO>;

/** Modelo de preview para la UI (frontend) */
export interface ThreadPreview {
  id: number;
  subject: string | null;
  isOneToOne: boolean;
  participants: UserSummary[];
  /** último mensaje (si no hay, null) */
  lastMessage: MessageModel | null;
  /** fecha del último mensaje (para ordenar/mostrar) */
  lastMessageAt: string | null;
  /** cantidad de no leídos para el usuario actual (si backend lo manda) */
  unreadCount: number;
  /** opcional: createdAt del hilo */
  createdAt?: Date;
}

export interface UnreadSummaryDTO {
  thread_id: number;
  unread_count: number;
  last_unread_at: string; // ISO
}

export interface UnreadSummary {
  threadId: number;
  unreadCount: number;
  lastUnreadAt: Date;
}

/** Respuesta DTO de /threads/unread */
export interface UnreadSummaryResponseDTO {
  data: UnreadSummaryDTO[];
  total: number;
}

export interface UnreadCountDTO {
  total: number;
}

