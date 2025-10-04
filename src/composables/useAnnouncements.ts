import { ref, computed, watch, onMounted, type Ref } from 'vue'
import {
    listAnnouncements,
    getAnnouncement,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    type AnnouncementsPage,
} from '@/services/announcements.service'
import type {
    Announcement,
    AnnouncementVisibility,
    CreateAnnouncementDTO,
    UpdateAnnouncementDTO,
} from '@/types/announcements'

type SortDir = 'asc' | 'desc'

export interface AnnouncementsFilters {
    page: number
    perPage: number
    search: string
    visibility?: AnnouncementVisibility
    archived?: boolean
    published?: boolean
    groupId?: number
    userId?: number
    sort?: string
    direction?: SortDir
}

function useDebounceFn<T extends (...args: any[]) => void>(fn: T, wait = 400) {
    let t: ReturnType<typeof setTimeout> | null = null
    return (...args: Parameters<T>) => {
        if (t) clearTimeout(t)
        t = setTimeout(() => fn(...args), wait)
    }
}

/** Composable para listado + filtros + paginación + CRUD */
export function useAnnouncementsList(initial?: Partial<AnnouncementsFilters>) {
    // --- state ---
    const announcements = ref<Announcement[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // paginación/orden/filtros
    const page = ref(initial?.page ?? 1)
    const perPage = ref(initial?.perPage ?? 10)
    const search = ref(initial?.search ?? '')
    const visibility = ref<AnnouncementVisibility | undefined>(initial?.visibility)
    const archived = ref<boolean | undefined>(initial?.archived)
    const published = ref<boolean | undefined>(initial?.published)
    const groupId = ref<number | undefined>(initial?.groupId)
    const userId = ref<number | undefined>(initial?.userId)
    const sort = ref<string | undefined>(initial?.sort)
    const direction = ref<SortDir | undefined>(initial?.direction)

    // paginación calculada del servidor
    const total = ref(0)
    const lastPage = ref(1)
    const hasNext = ref(false)
    const hasPrev = ref(false)

    const isEmpty = computed(() => !loading.value && announcements.value.length === 0)

    // --- core fetch ---
    async function fetchList() {
        loading.value = true
        error.value = null
        try {
            const pageResp: AnnouncementsPage = await listAnnouncements({
                page: page.value,
                perPage: perPage.value,
                search: search.value || undefined,
                visibility: visibility.value,
                archived: archived.value,
                published: published.value,
                groupId: groupId.value,
                userId: userId.value,
                sort: sort.value,
                direction: direction.value,
            })
            announcements.value = pageResp.items
            total.value = pageResp.total
            lastPage.value = pageResp.lastPage
            hasNext.value = pageResp.hasNext
            hasPrev.value = pageResp.hasPrev
        } catch (e: any) {
            // ajusta si usas Axios: if (isAxiosError(e)) ...
            error.value = e?.message ?? 'Error al cargar anuncios'
        } finally {
            loading.value = false
        }
    }

    const debouncedFetchBySearch = useDebounceFn(() => {
        page.value = 1 // al buscar, regresa a la primera página
        fetchList()
    }, 400)

    // --- watchers ---
    watch(
        [page, perPage, visibility, archived, published, groupId, userId, sort, direction],
        () => fetchList(),
        { immediate: true }
    )
    watch(search, () => debouncedFetchBySearch())

    onMounted(() => {
        // si prefieres, puedes depender solo de los watchers (ya tienen immediate)
    })

    // --- helpers de paginación ---
    function nextPage() {
        if (hasNext.value) page.value += 1
    }
    function prevPage() {
        if (hasPrev.value && page.value > 1) page.value -= 1
    }
    function setPage(p: number) {
        page.value = Math.max(1, p)
    }
    function setPerPage(n: number) {
        perPage.value = Math.max(1, n)
        page.value = 1
    }
    function resetFilters() {
        search.value = ''
        visibility.value = undefined
        archived.value = undefined
        published.value = undefined
        groupId.value = undefined
        userId.value = undefined
        sort.value = undefined
        direction.value = undefined
        page.value = 1
    }

    // --- CRUD con actualización optimista sobre la lista ---
    async function createOne(payload: CreateAnnouncementDTO) {
        const created = await createAnnouncement(payload)
        // prepend optimista (ajusta a tu preferencia)
        announcements.value = [created, ...announcements.value]
        total.value += 1
        return created
    }

    async function updateOne(id: number, payload: UpdateAnnouncementDTO) {
        const updated = await updateAnnouncement(id, payload)
        const idx = announcements.value.findIndex((a) => a.id === id)
        if (idx !== -1) {
            announcements.value.splice(idx, 1, updated)
        }
        return updated
    }

    async function removeOne(id: number) {
        await deleteAnnouncement(id)
        const before = announcements.value.length
        announcements.value = announcements.value.filter((a) => a.id !== id)
        if (announcements.value.length < before) total.value = Math.max(0, total.value - 1)
    }

    async function refresh() {
        await fetchList()
    }

    return {
        // estado
        announcements,
        loading,
        error,
        isEmpty,
        // paginación servidor
        total,
        lastPage,
        hasNext,
        hasPrev,
        // filtros
        page,
        perPage,
        search,
        visibility,
        archived,
        published,
        groupId,
        userId,
        sort,
        direction,
        // acciones
        fetchList,
        nextPage,
        prevPage,
        setPage,
        setPerPage,
        resetFilters,
        createOne,
        updateOne,
        removeOne,
        refresh,
    }
}

/** Composable para un solo anuncio (detalle) */
export function useAnnouncement(idRef: Ref<number | null>) {
    const announcement = ref<Announcement | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchOne(id: number) {
        loading.value = true
        error.value = null
        try {
            announcement.value = await getAnnouncement(id)
        } catch (e: any) {
            error.value = e?.message ?? 'Error al cargar el anuncio'
        } finally {
            loading.value = false
        }
    }

    watch(
        idRef,
        (id) => {
            if (id != null) fetchOne(id)
        },
        { immediate: true }
    )

    async function refresh() {
        if (idRef.value != null) await fetchOne(idRef.value)
    }

    return {
        announcement,
        loading,
        error,
        refresh,
    }
}
