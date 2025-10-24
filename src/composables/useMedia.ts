import { ref, computed, watch, onMounted } from 'vue'
import type { MediaItem, MediaScope, CreateMediaDTO, UpdateMediaDTO } from '@/types/media'
import { listMedia, getMedia, createMedia, updateMedia, deleteMedia, mediaThumbnailUrl, mediaDownloadUrl } from '@/services/media.service'

export function useMedia() {
  // Estado
  const items = ref<MediaItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const page = ref(1)
  const perPage = ref(12)
  const total = ref(0)
  const lastPage = ref(1)

  // Filtros
  const search = ref('')
  const scope = ref<MediaScope | undefined>(undefined)
  const groupId = ref<number | undefined>(undefined)
  const userId = ref<number | undefined>(undefined)
  const sort = ref<string | undefined>('created_at')
  const direction = ref<'asc' | 'desc' | undefined>('desc')

  const hasNext = computed(() => page.value < lastPage.value)
  const hasPrev = computed(() => page.value > 1)

  async function fetchList() {
    loading.value = true
    error.value = null
    try {
      const res = await listMedia({
        page: page.value,
        perPage: perPage.value,
        search: search.value || undefined,
        scope: scope.value,
        groupId: groupId.value,
        userId: userId.value,
        sort: sort.value,
        direction: direction.value,
      })

      items.value = res.items
      console.log(items.value)
      total.value = res.total
      lastPage.value = res.lastPage
    } catch (e: any) {
      error.value = e?.message ?? 'Error al cargar multimedia'
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: number) {
    loading.value = true
    error.value = null
    try {
      return await getMedia(id)
    } catch (e: any) {
      error.value = e?.message ?? 'Error al obtener elemento'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createOne(payload: CreateMediaDTO) {
    loading.value = true
    error.value = null
    try {
      const created = await createMedia(payload)
      // Opcional: refrescar lista o insertar en items si coincide con filtros
      await fetchList()
      return created
    } catch (e: any) {
      error.value = e?.message ?? 'Error al crear'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateOne(id: number, payload: UpdateMediaDTO) {
    loading.value = true
    error.value = null
    try {
      const updated = await updateMedia(id, payload)
      // refresco optimista
      const idx = items.value.findIndex(x => x.id === id)
      if (idx !== -1) items.value[idx] = updated
      return updated
    } catch (e: any) {
      error.value = e?.message ?? 'Error al actualizar'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function removeOne(id: number) {
    loading.value = true
    error.value = null
    try {
      await deleteMedia(id)
      items.value = items.value.filter(x => x.id !== id)
      total.value = Math.max(0, total.value - 1)
    } catch (e: any) {
      error.value = e?.message ?? 'Error al eliminar'
      throw e
    } finally {
      loading.value = false
    }
  }

  function thumbUrl(id: number, size: 'sm' | 'md' | 'lg' = 'sm') {
    return mediaThumbnailUrl(id, size)
  }

  function downloadUrl(id: number) {
    return mediaDownloadUrl(id)
  }

  function resetFilters() {
    search.value = ''
    scope.value = undefined
    groupId.value = undefined
    userId.value = undefined
    sort.value = 'created_at'
    direction.value = 'desc'
    page.value = 1
  }

  // Auto recargar cuando cambien filtros/paginación
  watch([page, perPage, search, scope, groupId, userId, sort, direction], () => {
    fetchList()
  })


  return {
    // state
    items, loading, error,
    page, perPage, total, lastPage, hasNext, hasPrev,
    search, scope, groupId, userId, sort, direction,

    // actions
    fetchList, fetchOne, createOne, updateOne, removeOne,
    resetFilters,

    // utils
    thumbUrl, downloadUrl,
  }
}
