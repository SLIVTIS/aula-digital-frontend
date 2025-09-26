import { ref, onMounted } from 'vue';
import { listUsers, getUser, deleteUser, createUser, updateUser } from '@/services/users.service';
import type { User, UserForm } from '@/types/user';
import type { RoleStats } from '@/types/pagination'

export function useUsersCrud(options?: { autoLoad?: boolean }) {
    const autoLoad = options?.autoLoad ?? true;

    // Estado
    const users = ref<User[]>([])
    const current = ref<User | null>(null)
    const loading = ref(false)
    const error = ref<unknown>(null)
    const page = ref(1)
    const perPage = ref(15)
    const total = ref(0)
    const lastPage = ref(1)
    const roleStatsAll = ref<RoleStats>({ admin: 0, teacher: 0, parent: 0 })
    const roleStatsFiltered = ref<RoleStats>({ admin: 0, teacher: 0, parent: 0 })

    // Helpers
    function setError(e: unknown) { error.value = e; console.error(e); }

    // Acciones
    async function loadList() {
        loading.value = true; error.value = null;
        try {
            const res = await listUsers({ page: page.value, perPage: perPage.value /*, search */ });
            users.value = res.items;
            page.value = res.page;
            perPage.value = res.perPage;
            total.value = res.total;
            roleStatsAll.value = res.RolStatsGlobals
            roleStatsFiltered.value = res.RolStatsFiltered
            lastPage.value = res.lastPage;
        } catch (e) { error.value = e; }
        finally { loading.value = false; }
    }

    async function loadOne(id: number) {
        loading.value = true; error.value = null;
        try { current.value = await getUser(id); }
        catch (e) { setError(e); }
        finally { loading.value = false; }
    }

    async function create(form: UserForm) {
        loading.value = true; error.value = null;
        try {
            const created = await createUser(form);
            users.value.unshift(created);
            return created;
        } catch (e) {
            setError(e); throw e;
        } finally {
            loading.value = false;
        }
    }

    async function update(id: number, form: Partial<UserForm>) {
        // Optimista + rollback
        const idx = users.value.findIndex(u => u.id === id);
        const backup = idx >= 0 ? { ...users.value[idx] } : null;

        if (idx >= 0) users.value[idx] = { ...users.value[idx], ...form } as User;
        if (current.value?.id === id) current.value = { ...(current.value), ...form } as User;

        try {
            const saved = await updateUser(id, form);
            if (idx >= 0) users.value[idx] = saved;
            if (current.value?.id === id) current.value = saved;
            return saved;
        } catch (e) {
            if (idx >= 0 && backup) users.value[idx] = backup;
            setError(e); throw e;
        }
    }

    async function remove(id: number) {
        const idx = users.value.findIndex(u => u.id === id);
        const backup = idx >= 0 ? users.value[idx] : null;

        if (idx >= 0) users.value.splice(idx, 1);
        if (current.value?.id === id) current.value = null;

        try {
            await deleteUser(id);
        } catch (e) {
            if (idx >= 0 && backup) users.value.splice(idx, 0, backup); // rollback
            setError(e);
            throw e;
        }
    }

    function resetCurrent() { current.value = null; }

    if (autoLoad) onMounted(loadList);

    return {
        // estado
        users, current, loading, error, roleStatsFiltered,
        // acciones
        loadList, loadOne, create, remove, update, resetCurrent, total
    };
}
