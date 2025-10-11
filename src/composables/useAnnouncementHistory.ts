import { ref, computed } from 'vue'
import type { Announcement, AnnouncementVisibility } from '@/types/announcements'
import { listAnnouncementHistory, type AnnouncementsPage } from '@/services/announcements.service'
import { onMounted } from 'vue'

type Direction = 'asc' | 'desc'

export interface HistoryFilters {
    search?: string
    visibility?: AnnouncementVisibility
    archived?: boolean
    published?: boolean
    sort?: string
    direction?: Direction
}

export function useAnnouncementHistory(initial?: {
    page?: number
    perPage?: number
    filters?: HistoryFilters
}) {
    // state
    const announcements = ref<Announcement[]>([])
    const page = ref<number>(initial?.page ?? 1)
    const perPage = ref<number>(initial?.perPage ?? 15)
    const total = ref<number>(0)
    const lastPage = ref<number>(1)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    const filters = ref<HistoryFilters>({
        search: initial?.filters?.search ?? '',
        visibility: initial?.filters?.visibility,
        archived: initial?.filters?.archived,
        published: initial?.filters?.published,
        sort: initial?.filters?.sort,
        direction: initial?.filters?.direction,
    })

    const hasNext = computed(() => page.value < lastPage.value)
    const hasPrev = computed(() => page.value > 1)

    // debounce solo para el término de búsqueda
    let searchTimer: number | null = null
    function debounceSearch(ms = 350) {
        if (searchTimer) window.clearTimeout(searchTimer)
        searchTimer = window.setTimeout(() => {
            page.value = 1
            refresh()
        }, ms)
    }

    async function refresh(): Promise<AnnouncementsPage> {
        try {
            loading.value = true
            error.value = null

            const resp = await listAnnouncementHistory({
                page: page.value,
                perPage: perPage.value,
                search: filters.value.search,
                visibility: filters.value.visibility,
                archived: filters.value.archived,
                published: filters.value.published,
                sort: filters.value.sort,
                direction: filters.value.direction,
            })

            announcements.value = resp.items
            page.value = resp.page
            perPage.value = resp.perPage
            total.value = resp.total
            lastPage.value = resp.lastPage

            return resp
        } catch (e: any) {
            error.value = e?.message ?? 'Error al cargar el historial'
            throw e
        } finally {
            loading.value = false
        }
    }

    function setPage(p: number) {
        if (p < 1 || (lastPage.value && p > lastPage.value)) return
        page.value = p
        refresh()
    }

    function setPerPage(n: number) {
        perPage.value = n
        page.value = 1
        refresh()
    }

    function setFilters(next: Partial<HistoryFilters>) {
        const nextFilters = { ...filters.value, ...next }
        const searchChanged = next.hasOwnProperty('search') && nextFilters.search !== filters.value.search
        filters.value = nextFilters
        page.value = 1
        if (searchChanged) debounceSearch()
        else refresh()
    }

    function resetFilters() {
        filters.value = {}
        page.value = 1
        refresh()
    }

    onMounted(refresh);

    return {
        // state
        announcements,
        page,
        perPage,
        total,
        lastPage,
        loading,
        error,
        filters,

        // derived
        hasNext,
        hasPrev,

        // actions
        refresh,
        setPage,
        setPerPage,
        setFilters,
        resetFilters,
    }
}
