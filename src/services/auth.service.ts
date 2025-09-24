import { sendJSON } from '@/services/api';
import type { User } from '@/types';

export function login(payload: { email: string; password: string }) {
    return sendJSON<{ token: string; user: User }>('/login', 'POST', payload);
}

export function logout() {
    return sendJSON<{ message: string }>('/logout', 'POST');
}