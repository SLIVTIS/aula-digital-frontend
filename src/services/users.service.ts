import { getJSON, sendJSON } from '@/services/api';
import { toApiCreateUser, toApiUpdateUser, toModelUser } from '@/mappers/user.mapper';
import type { UserDTO, User, UserForm } from '@/types/user';
import type { LaravelPage, RoleStats } from '@/types/pagination';

const BASE = '/users';

export type UsersPage = {
    items: User[];
    page: number;
    perPage: number;
    total: number;
    RolStatsGlobals: RoleStats
    RolStatsFiltered: RoleStats
    lastPage: number;
    hasNext: boolean;
    hasPrev: boolean;
};

export async function listUsers(params?: { page?: number; perPage?: number; search?: string }): Promise<UsersPage> {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.perPage) q.set('per_page', String(params.perPage));
    if (params?.search) q.set('search', params.search);

    const url = q.toString() ? `${BASE}?${q}` : BASE;

    const page = await getJSON<LaravelPage<UserDTO>>(url);
    return {
        items: page.data.map(toModelUser), // <-- toma los usuarios de "data"
        page: page.current_page,
        perPage: page.per_page,
        total: page.total,
        RolStatsGlobals: page.total_roles.all,
        RolStatsFiltered: page.total_roles.filtered,
        lastPage: page.last_page,
        hasNext: !!page.next_page_url,
        hasPrev: !!page.prev_page_url,
    };
}

export async function getUser(id: number): Promise<User> {
    const dto = await getJSON<UserDTO>(`${BASE}/${id}`);
    return toModelUser(dto);
}

export async function createUser(form: UserForm): Promise<User> {
    const dto = await sendJSON<UserDTO>(BASE, 'POST', toApiCreateUser(form))
    return toModelUser(dto)
}

export async function updateUser(id: number, form: Partial<UserForm>): Promise<User> {
    const dto = await sendJSON<UserDTO>(`${BASE}/${id}`, 'PUT', toApiUpdateUser(form));
    return toModelUser(dto);
}

export async function deleteUser(id: number): Promise<void> {
    await sendJSON<void>(`${BASE}/${id}`, 'DELETE');
}