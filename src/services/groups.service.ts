import { getJSON, sendJSON } from '@/services/api';
import type { GroupDTO, LaravelPaginationDTO, PaginationParams } from '@/types/groups';

const BASE = '/groups';

const withQuery = (url: string, params?: Record<string, string | number | boolean | undefined>) => {
  if (!params) return url;
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
  });
  const sep = url.includes('?') ? '&' : '?';
  const query = q.toString();
  return query ? `${url}${sep}${query}` : url;
};

/**
 * Lista grupos con paginación de Laravel.
 * GET /api/groups?page=&per_page=&q=
 */
export async function listGroupsService(params: PaginationParams = {}) {
  const { page = 1, perPage = 20, q } = params;
  const url = withQuery(BASE, { page, per_page: perPage, q });
  // Tipamos la respuesta cruda del backend
  return await getJSON<LaravelPaginationDTO<GroupDTO>>(url);
}

/** Obtiene un grupo por id: GET /api/groups/:id */
export async function getGroupService(id: number) {
  return await getJSON<GroupDTO>(`${BASE}/${id}`);
}

/** Crea un grupo: POST /api/groups */
export interface CreateGroupPayload {
  name: string;
  grade?: string | null;
  section?: string | null;
  code?: string | null;
}
export async function createGroupService(payload: CreateGroupPayload) {
  return await sendJSON<GroupDTO>(BASE, 'POST', payload);
}

/** Actualiza un grupo: PUT/PATCH /api/groups/:id */
export type UpdateGroupPayload = Partial<CreateGroupPayload>;
export async function updateGroupService(id: number, payload: UpdateGroupPayload) {
  return await sendJSON<GroupDTO>(`${BASE}/${id}`, 'PUT', payload);
}

/** Elimina un grupo: DELETE /api/groups/:id */
export async function deleteGroupService(id: number) {
  return await sendJSON<void>(`${BASE}/${id}`, 'DELETE');
}
