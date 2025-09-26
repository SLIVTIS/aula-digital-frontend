export interface User {
    id: number
    email: string
    name: string
    role: Role
    avatarPath?: string
    createdAt?: string
}

export interface Role {
    id: number,
    slug: string,
    name: string
}

// Datos que manejas en formularios
export interface UserForm {
    name: string
    email: string
    role: number
    password?: string
    password_confirmation?: string
    avatar?: string
}

// DTOs expuestos por la API (lo que regresa el backend)
export interface UserDTO {
    id: number
    name: string
    email: string
    role: Role
    avatar_path?: string
    created_at?: string
}

// Request para crear
export interface CreateUserDTO {
    name: string
    email: string
    role_id: number
    password: string
    password_confirmation: string,
    avatar?: string
}

// Request para actualizar (parcial)
export interface UpdateUserDTO {
    name?: string
    email?: string
    role?: number
    password?: string
    avatar?: string
}