import type {
    User, UserForm,
    UserDTO, CreateUserDTO, UpdateUserDTO
} from '@/types/user';

// DTO (API) -> Modelo UI
export function toModelUser(dto: UserDTO): User {
    return {
        id: dto.id,
        name: dto.name,
        email: dto.email,
        role: dto.role,
        createdAt: dto.created_at,
    };
}

// Form (UI) -> DTO de creación (API)
export function toApiCreateUser(form: UserForm): CreateUserDTO {
    return {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role_id: form.role,
        password: form.password,
        password_confirmation: form.password_confirmation
    };
}

// Form parcial (UI) -> DTO de actualización (API)
export function toApiUpdateUser(partial: Partial<UserForm>): UpdateUserDTO {
    const out: UpdateUserDTO = {};
    if (typeof partial.name === 'string') out.name = partial.name.trim();
    if (typeof partial.email === 'string') out.email = partial.email.trim().toLowerCase();
    if (typeof partial.role === 'string') out.role = partial.role;
    if (typeof partial.password === 'string' && partial.password) out.password = partial.password;
    return out;
}
