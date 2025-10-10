import { ref, computed, watch, onMounted } from 'vue';
import type { Group, Page, PaginationParams } from '@/types/groups';
import { listGroupsService, getGroupService, createGroupService, updateGroupService, deleteGroupService } from '@/services/groups.service';
import { mapGroupDTO, mapPaginatedGroupsDTO } from '@/mappers/groups.mapper';

export function useGroupsList(initial: PaginationParams = {}) {
  const groups = ref<Group[]>([]);
  const page = ref<number>(initial.page ?? 1);
  const perPage = ref<number>(initial.perPage ?? 20);
  const q = ref<string>(initial.q ?? '');
  const total = ref<number>(0);
  const lastPage = ref<number>(1);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const hasNext = computed(() => page.value < lastPage.value);
  const hasPrev = computed(() => page.value > 1);

  async function fetchList() {
    loading.value = true;
    error.value = null;
    try {
      const raw = await listGroupsService({ page: page.value, perPage: perPage.value, q: q.value });
      const { data, meta } = mapPaginatedGroupsDTO(raw) as Page<Group>;
      groups.value = data;
      total.value = meta.total;
      lastPage.value = meta.lastPage;
    } catch (e: any) {
      error.value = e?.message ?? 'Error al cargar grupos';
    } finally {
      loading.value = false;
    }
  }

  function nextPage() {
    if (hasNext.value) {
      page.value += 1;
      fetchList();
    }
  }

  function prevPage() {
    if (hasPrev.value) {
      page.value -= 1;
      fetchList();
    }
  }

  function goToPage(p: number) {
    if (p >= 1 && p <= lastPage.value) {
      page.value = p;
      fetchList();
    }
  }

  function setPerPage(n: number) {
    perPage.value = n;
    page.value = 1; // reiniciamos para evitar página fuera de rango
    fetchList();
  }

  function setQuery(term: string) {
    q.value = term;
    page.value = 1;
    fetchList();
  }

  // Carga inicial
  onMounted(fetchList);

  // Re-cargar cuando cambien reactivamente los filtros desde fuera:
  watch([page, perPage], fetchList);

  return {
    // state
    groups, page, perPage, q, total, lastPage, loading, error,
    hasNext, hasPrev,
    // actions
    fetchList, nextPage, prevPage, goToPage, setPerPage, setQuery,
  };
}

export function useGroupDetail(id: number | null) {
  const group = ref<Group | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  async function fetchOne() {
    if (!id) return;
    loading.value = true;
    error.value = null;
    try {
      const dto = await getGroupService(id);
      group.value = mapGroupDTO(dto);
    } catch (e: any) {
      error.value = e?.message ?? 'Error al cargar el grupo';
    } finally {
      loading.value = false;
    }
  }

  onMounted(fetchOne);

  return { group, loading, error, fetchOne };
}

/** Helpers CRUD para crear/editar/eliminar desde una vista */
export function useGroupMutations() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function create(payload: { name: string; grade?: string | null; section?: string | null; code?: string | null; }) {
    loading.value = true;
    error.value = null;
    try {
      const dto = await createGroupService(payload);
      return mapGroupDTO(dto);
    } catch (e: any) {
      error.value = e?.message ?? 'Error al crear el grupo';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function update(id: number, payload: Partial<{ name: string; grade?: string | null; section?: string | null; code?: string | null; }>) {
    loading.value = true;
    error.value = null;
    try {
      const dto = await updateGroupService(id, payload);
      return mapGroupDTO(dto);
    } catch (e: any) {
      error.value = e?.message ?? 'Error al actualizar el grupo';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await deleteGroupService(id);
      return true;
    } catch (e: any) {
      error.value = e?.message ?? 'Error al eliminar el grupo';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return { create, update, remove, loading, error };
}
