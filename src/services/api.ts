import { useAuthStore } from "@/stores/auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError<T = unknown> extends Error {
    status: number
    data?: T
    constructor(message: string, status: number, data?: T) {
        super(message)
        this.status = status
        this.data = data
    }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
    let token = ''

    try {
        // Intenta leer desde Pinia (solo si ya existe una instancia activa)
        const auth = useAuthStore()
        token = auth?.token || ''
    } catch {
        // Pinia aún no está disponible
    }
    // Llama a localStorage si no se obtuvo el token del store
    if (!token) {
        token = localStorage.getItem('token') || ''
    }

    const headers = new Headers(options.headers || {});
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');

    let body = options.body;
    if (body && typeof body === 'object' && !(body instanceof FormData)) {
        if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
        body = JSON.stringify(body);
    }

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers, body });

    if (!res.ok) {
        let detail: unknown = undefined;
        try { detail = await res.json(); } catch { detail = await res.text().catch(() => ''); }
        const err: any = new Error((detail as any)?.message || res.statusText);
        err.status = res.status;
        err.data = detail;
        throw err;
    }

    return res;
}

// helpers
export async function getJSON<T>(path: string) {
    const res = await apiFetch(path);
    return res.json() as Promise<T>;
}
export async function sendJSON<T>(path: string, method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', payload?: unknown) {
    const res = await apiFetch(path, { method, body: payload as any });
    return res.json() as Promise<T>;
}
