export interface GroupDTO {
  id: number;
  name: string;
  grade: string | null;
  section: string | null;
  code: string | null;
  created_at: string; // ISO
  updated_at: string; // ISO
}

/**
 * Estructura de paginación típica de Laravel
 */
export interface LaravelPaginationDTO<T> {
  current_page: number;
  data: T[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

/** Dominio (frontend) */
export interface Group {
  id: number;
  name: string;
  grade?: string | null;
  section?: string | null;
  code?: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/** Metadatos de página, normalizados */
export interface PageMeta {
  page: number;
  perPage: number;
  total: number;
  from: number | null;
  to: number | null;
  lastPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** Página de resultados normalizada */
export interface Page<T> {
  data: T[];
  meta: PageMeta;
}

export interface PaginationParams {
  page?: number;     // default: 1
  perPage?: number;  // default: 20 (según tu API)
  // Agrega filtros si tu backend los soporta (q, grade, section, etc.)
  q?: string;
}