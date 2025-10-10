import { ref, reactive, computed } from 'vue'
import type { CreateAnnouncementDTO } from '@/types/announcements'
import { createAnnouncement } from '@/services/announcements.service'

// Tipo auxiliar para un target editable en el formulario
export type EditableTarget =
  | { target_type: 'group'; group_id: number; user_id?: never }
  | { target_type: 'user'; user_id: number; group_id?: never }

export type FieldErrors = Partial<
  Record<'title' | 'body_md' | 'visibility' | 'targets' | 'post', string>
>

export function useCreateAnnouncement(initial?: Partial<CreateAnnouncementDTO>) {
  // --- State ---
  const form = reactive<
    Required<Omit<CreateAnnouncementDTO, 'targets'>> & { targets: EditableTarget[] }
  >({
    title: initial?.title ?? '',
    body_md: initial?.body_md ?? '',
    visibility: initial?.visibility ?? 'all',
    post: initial?.post ?? false,
    targets: Array.isArray(initial?.targets) ? initial.targets : []
  })

  const loading = ref(false)
  const lastError = ref<unknown>(null)
  const fieldErrors = ref<FieldErrors>({})

  // --- Computed helpers ---
  const hasTargets = computed(() => form.targets.length > 0)

  const canSubmit = computed(() => {
    if (!form.title.trim()) return false
    if (!form.body_md.trim()) return false
    if (form.visibility === 'groups' && !form.targets.some((t) => t.target_type === 'group'))
      return false
    if (form.visibility === 'users' && !form.targets.some((t) => t.target_type === 'user'))
      return false
    return true
  })

  function addGroupTarget(group_id: number) {
    // Evitar duplicados group
    if (!form.targets.some((t) => t.target_type === 'group' && t.group_id === group_id)) {
      form.targets.push({ target_type: 'group', group_id })
    }
  }

  function addUserTarget(user_id: number) {
    // Evitar duplicados user
    if (!form.targets.some((t) => t.target_type === 'user' && t.user_id === user_id)) {
      form.targets.push({ target_type: 'user', user_id })
    }
  }

  function removeTarget(type: 'group' | 'user', id: number): boolean {
    if (!Array.isArray(form.targets)) return false

    const idx = form.targets.findIndex(
      (t) => t.target_type === type && (type === 'group' ? t.group_id === id : t.user_id === id)
    )

    if (idx !== -1) {
      form.targets.splice(idx, 1)
      return true
    }
    return false
  }

  function reset() {
    form.title = initial?.title ?? ''
    form.body_md = initial?.body_md ?? ''
    form.visibility = initial?.visibility ?? 'all'
    form.post = initial?.post ?? false
    form.targets = (initial?.targets as EditableTarget[] | undefined)
      ? [...(initial!.targets as EditableTarget[])]
      : []
    fieldErrors.value = {}
    lastError.value = null
  }

  // --- Validation (ligera) ---
  function validate(): boolean {
    const errs: FieldErrors = {}

    if (!form.title || form.title.trim().length < 3) {
      errs.title = 'El título es obligatorio (mín. 3 caracteres).'
    }
    if (!form.body_md || form.body_md.trim().length < 5) {
      errs.body_md = 'El contenido es obligatorio (mín. 5 caracteres).'
    }

    if (form.visibility === 'groups' && !form.targets.some((t) => t.target_type === 'group')) {
      errs.targets = 'Debes elegir al menos 1 grupo.'
    }
    if (form.visibility === 'users' && !form.targets.some((t) => t.target_type === 'user')) {
      errs.targets = 'Debes elegir al menos 1 usuario.'
    }

    fieldErrors.value = errs
    return Object.keys(errs).length === 0
  }

  // --- Submit ---
  async function submit(post: boolean) {
    lastError.value = null
    if (!validate()) return null

    const payload: CreateAnnouncementDTO = {
      title: form.title.trim(),
      body_md: form.body_md.trim(),
      visibility: form.visibility,
      post: post,
      // Enviar targets solo si la visibilidad no es "all"
      targets:
        form.visibility === 'all'
          ? undefined
          : form.targets.map((t) =>
              t.target_type === 'group'
                ? { target_type: 'group', group_id: t.group_id }
                : { target_type: 'user', user_id: t.user_id }
            )
    }

    try {
      loading.value = true
      const created = await createAnnouncement(payload as unknown as CreateAnnouncementDTO)
      reset()
      return created
    } catch (err: any) {
      lastError.value = err
      // Intento de mapear errores tipo Laravel { errors: { campo: [..] } }
      const maybe = err?.errors
      if (maybe && typeof maybe === 'object') {
        const fe: FieldErrors = {}
        const allowedKeys: (keyof FieldErrors)[] = [
          'title',
          'body_md',
          'visibility',
          'targets',
          'post'
        ]
        type LaravelErrors = Record<string, string[] | string>
        const errsObj = maybe as LaravelErrors

        for (const key of Object.keys(errsObj)) {
          const raw = errsObj[key]
          const msg = Array.isArray(raw) ? raw[0] : String(raw)
          if ((allowedKeys as readonly string[]).includes(key)) {
            fe[key as keyof FieldErrors] = msg
          }
        }
        fieldErrors.value = fe
      }
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    form,
    loading,
    lastError,
    fieldErrors,
    hasTargets,
    canSubmit,

    // Mutators
    addGroupTarget,
    addUserTarget,
    removeTarget,
    reset,

    // Actions
    submit
  }
}
