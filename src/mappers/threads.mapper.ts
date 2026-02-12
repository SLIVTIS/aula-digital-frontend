import type {
  ThreadDTO,
  ThreadModel,
  UserSummaryDTO,
  UserSummary,
  MessageDTO,
  MessageModel,
  PaginatedMessages,
  ThreadListItemDTO,
  ThreadPreview,
  UnreadSummaryDTO,
  UnreadSummary
} from "@/types/threads";
import type { LaravelPage } from "@/types/pagination";

export function mapUserSummaryDTO(d: UserSummaryDTO): UserSummary {
  return {
    id: d.id,
    name: d.name,
    role: d.role ?? null,
    avatar: d.avatar_url ?? null,
  };
}

export function mapThreadDTO(d: ThreadDTO): ThreadModel {
  return {
    id: d.id,
    subject: d.subject,
    isOneToOne: d.is_one_to_one,
    participants: d.participants?.map(mapUserSummaryDTO) ?? [],
    createdAt: d["created_at"] ? new Date(d["created_at"]) : undefined,
  };
}

export function mapMessageDTO(d: MessageDTO): MessageModel {
  return {
    id: d.id,
    threadId: d.thread_id,
    senderUserId: d.sender_user_id,
    bodyMd: d.body_md,
    //createdAt: new Date(d.created_at),
    createdAt: d.created_at,
    sender: d.sender ? mapUserSummaryDTO(d.sender) : undefined,
  };
}

export function mapPaginatedMessagesDTO(dto: LaravelPage<MessageDTO>): PaginatedMessages {
  return {
    ...dto,
    data: dto.data.map(mapMessageDTO),
  };
}

/** Robustez: toma el último mensaje ya sea en d.last_message o d.messages[0] */
function pickLastMessageDTO(d: ThreadListItemDTO): MessageDTO | null {
  if (d.last_message) return d.last_message;
  if (Array.isArray(d.messages) && d.messages.length > 0) return d.messages[0];
  return null;
}

/** Mapea un ítem del listado a un preview usable en la UI */
export function mapThreadListItemDTO(d: ThreadListItemDTO): ThreadPreview {
  const last = pickLastMessageDTO(d);
  const mappedLast = last ? mapMessageDTO(last) : null;

  return {
    id: d.id,
    subject: d.subject,
    isOneToOne: d.is_one_to_one,
    participants: (d.participants ?? []).map(mapUserSummaryDTO),
    lastMessage: mappedLast,
    lastMessageAt: mappedLast ? mappedLast.createdAt : null,
    unreadCount: typeof d.unread_count === "number" ? d.unread_count : 0,
    createdAt: d["created_at"] ? new Date(d["created_at"]) : undefined,
  };
}

/** Mapea un paginator DTO genérico a data tipada */
export function mapPaginatedDTO<T, U>(
  dto: LaravelPage<T>,
  mapper: (t: T) => U
): Omit<LaravelPage<U>, "data"> & { data: U[] } {
  return { ...dto, data: dto.data.map(mapper) };
}

export function mapUnreadSummaryDTO(d: UnreadSummaryDTO): UnreadSummary {
  return {
    threadId: d.thread_id,
    unreadCount: d.unread_count,
    lastUnreadAt: new Date(d.last_unread_at),
  };
}


