import type { User } from "./user"
export interface GalleryItem {
  id: number;
  title: string;
  url: string; // URL donde se encuentra el archivo (foto o video)
  mimeType: 'image' | 'video'; // Tipo de archivo para saber cómo renderizarlo
  uploadedBy: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
  expiresAt: string
}

export interface Child {
  id: string
  name: string
  grade: string
  group: string
}
