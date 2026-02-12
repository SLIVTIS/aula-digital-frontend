import { ref, computed } from 'vue'
import { createMedia } from '@/services/media.service'
import type { CreateMediaDTO, MediaItem, MediaScope } from '@/types/media'
import { useGroupsList } from '@/composables/useGroups' // <-- tu composable de grupos

// Solo permitimos 'all' | 'groups'
type ScopeAllowed = Extract<MediaScope, 'all' | 'groups'>

export function useMediaUpload() {
    // --- estado de subida ---
    const file = ref<File | null>(null)
    const title = ref('')
    const description = ref<string | null>(null)
    const scope = ref<ScopeAllowed>('all')

    const isUploading = ref(false)
    const error = ref<string | null>(null)
    const result = ref<MediaItem | null>(null)

    // --- grupos desde API (usamos TU composable) ---
    const {
        groups, page, perPage, q, total, lastPage,
        loading: groupsLoading, error: groupsError,
        hasNext, hasPrev, fetchList, nextPage, prevPage, goToPage, setPerPage, setQuery,
    } = useGroupsList({ page: 1, perPage: 20 })

    // selección de grupos (ids)
    const selectedGroupIds = ref<number[]>([])
    const hasSelectedGroups = computed(() => selectedGroupIds.value.length > 0)

    function toggleGroup(id: number) {
        const i = selectedGroupIds.value.indexOf(id)
        if (i === -1) selectedGroupIds.value.push(id)
        else selectedGroupIds.value.splice(i, 1)
    }

    const canSubmit = computed(() => {
        if (!file.value || !title.value.trim() || isUploading.value) return false
        if (scope.value === 'groups' && !hasSelectedGroups.value) return false
        return true
    })

    function reset() {
        file.value = null
        title.value = ''
        description.value = null
        scope.value = 'all'
        isUploading.value = false
        error.value = null
        result.value = null
        selectedGroupIds.value = []
        // mantener estado de lista si quieres; si prefieres limpiar:
        // q.value = ''; page.value = 1; fetchList();
    }

    async function upload() {
        if (!file.value) {
            error.value = 'Selecciona un archivo.'
                ; return
        }
        isUploading.value = true
        error.value = null
        try {
            // 🔧 Fix del error TS: usar literales con `as const`
            const targets =
                scope.value === 'groups'
                    ? selectedGroupIds.value.map((id) => ({ target_type: 'group' as const, group_id: id }))
                    : undefined

            const dto: CreateMediaDTO = {
                file: file.value,
                title: title.value.trim(),
                description: description.value ?? undefined,
                scope: scope.value,     // 'all' | 'groups'
                targets,                // solo si groups
            }

            const media = await createMedia(dto)
            result.value = media
            return media
        } catch (e: any) {
            error.value = e?.message ?? 'No se pudo subir el archivo.'
            throw e
        } finally {
            isUploading.value = false
        }
    }

    return {
        // subida
        file, title, description, scope,
        isUploading, error, result, canSubmit, upload, reset,

        // grupos (desde tu composable)
        groups, page, perPage, q, total, lastPage,
        groupsLoading, groupsError,
        hasNext, hasPrev, fetchList, nextPage, prevPage, goToPage, setPerPage, setQuery,

        // selección
        selectedGroupIds, hasSelectedGroups, toggleGroup,
    }
}

