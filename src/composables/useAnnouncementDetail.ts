import { ref, computed, watch, onMounted, toValue, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { getAnnouncement, updateAnnouncement } from '@/services/announcements.service'
import type { Announcement, GroupSummary, UpdateAnnouncementDTO, UserSummary } from '@/types/announcements'

type MaybeRef<T> = T | Ref<T>

export interface UseAnnouncementDetailOptions {
  /** Id del anuncio. Si no se pasa, se toma de route.params.id */
  id?: MaybeRef<number | null | undefined>
  /** Prefetch al montar (default: true) */
  prefetch?: boolean
  /** Id del usuario actual para evaluar "ya leído" */
  currentUserId?: MaybeRef<number | undefined>
  /** Observar cambios de la ruta y recargar (default: true) */
  watchRoute?: boolean
  /**
   * Función opcional para marcar como leído en backend.
   */
  markReadFn?: (id: number) => Promise<void>
}

const cache = new Map<number, Announcement>()

export function useAnnouncementDetail(opts: UseAnnouncementDetailOptions = {}) {
  const route = useRoute()

  // ---- Resolución del id ----
  const id = ref<number | null | undefined>(
    toValue(opts.id) ?? (route.params.id ? Number(route.params.id) : undefined)
  )

  // ---- Estado base ----
  const announcement = ref<Announcement | null>(id.value ? cache.get(id.value) ?? null : null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const prefetch = opts.prefetch ?? true
  const watchRoute = opts.watchRoute ?? true
  const currentUserId = computed(() => toValue(opts.currentUserId))

  // ---- Carga ----
  async function load(force = false) {
    const _id = id.value
    if (!_id || Number.isNaN(_id)) return

    // usa caché si existe y no se fuerza
    if (!force && cache.has(_id) && !announcement.value) {
      announcement.value = cache.get(_id) ?? null
    }

    loading.value = true
    try {
      const data = await getAnnouncement(_id)
      announcement.value = data
      cache.set(_id, data)
      error.value = null
    } catch (e: any) {
      error.value = e?.message ?? 'Error al cargar el anuncio'
    } finally {
      loading.value = false
    }
  }

  // ---- Mutaciones ----
  async function update(fields: UpdateAnnouncementDTO) {
    if (!id.value) return
    loading.value = true
    try {
      const updated = await updateAnnouncement(id.value, fields)
      announcement.value = updated
      cache.set(id.value, updated)
      error.value = null
      return updated
    } catch (e: any) {
      error.value = e?.message ?? 'Error al actualizar el anuncio'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function toggleArchived() {
    if (!announcement.value) return
    return update({ is_archived: !announcement.value.is_archived })
  }

  // Si tienes endpoint para leído, inyéctalo vía opts.markReadFn
  async function markAsRead() {
    if (!announcement.value || !id.value) return
    try {
      if (opts.markReadFn) {
        await opts.markReadFn(id.value)
      }
      // Actualiza estado local para reflejarse en UI
      if (currentUserId.value && !hasRead.value) {
        announcement.value.reads.push({
          announcement_id: id.value,
          user_id: currentUserId.value,
          read_at: new Date().toISOString(),
        })
      }
    } catch (e) {
      // No cambiamos error global del detalle para no romper la vista
      // pero puedes levantar un toast aquí desde el componente
      console.warn('markAsRead failed', e)
    }
  }

  // ---- Computeds útiles ----
  const isArchived = computed(() => !!announcement.value?.is_archived)

  const publishedAt = computed<Date | null>(() => {
    const p = announcement.value?.published_at
    return p ? new Date(p) : null
  })

  const isPublished = computed(() => {
    const d = publishedAt.value
    return !!d && d.getTime() <= Date.now()
  })

  const targetsGroups = computed(() =>
    (announcement.value?.targets ?? []).filter(t => t.target_type === 'group' && t.group != null).map(t => t.group as GroupSummary)
  )
  const targetsUsers = computed(() =>
    (announcement.value?.targets ?? []).filter(t => t.target_type === 'user' && t.user != null).map(t => t.user as UserSummary)
  )

  const readsCount = computed(() => announcement.value?.reads.length ?? 0)
  const hasRead = computed(() => {
    const uid = currentUserId.value
    if (!uid) return false
    return (announcement.value?.reads ?? []).some(r => r.user_id === uid)
  })

  // ---- Utilidades ----
  function invalidateCache(_id?: number) {
    const key = _id ?? id.value
    if (key) cache.delete(key)
  }

  async function refresh() {
    await load(true)
  }

  // ---- Efectos ----
  onMounted(() => {
    if (prefetch) load(false)
  })

  // Si cambian opts.id desde fuera
  watch(
    () => toValue(opts.id),
    (newId) => {
      if (typeof newId === 'number' && !Number.isNaN(newId)) {
        id.value = newId
        announcement.value = cache.get(newId) ?? null
        load(false)
      }
    }
  )

  // Observar ruta
  if (watchRoute) {
    watch(
      () => route.params.id,
      (rid) => {
        const numeric = rid ? Number(rid) : undefined
        if (typeof numeric === 'number' && !Number.isNaN(numeric)) {
          id.value = numeric
          announcement.value = cache.get(numeric) ?? null
          load(false)
        }
      }
    )
  }

  return {
    // state
    id,
    announcement,
    loading,
    error,

    // computeds
    isArchived,
    isPublished,
    publishedAt,
    targetsGroups,
    targetsUsers,
    readsCount,
    hasRead,

    // actions
    load,
    refresh,
    update,
    toggleArchived,
    markAsRead,

    // utils
    invalidateCache,
  }
}
