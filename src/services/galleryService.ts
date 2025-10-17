// src/services/galleryService.ts

import axios from "axios"
import type { GalleryItem, ApiResponse } from "@/types"

// Cambia esta URL base según tu configuración del backend
const API_URL = "http://localhost:8000/api/gallery"

// 🔹 Obtener lista de archivos multimedia
export const getMedia = async (): Promise<GalleryItem[]> => {
  try {
    const response = await axios.get<ApiResponse<GalleryItem[]>>(API_URL)
    if (response.data.success) {
      return response.data.data
    } else {
      console.error("Error en respuesta de API:", response.data.message)
      return []
    }
  } catch (error) {
    console.error("Error al obtener archivos multimedia:", error)
    return []
  }
}

// 🔹 Subir archivo multimedia
export const uploadMedia = async (formData: FormData): Promise<boolean> => {
  try {
    const response = await axios.post<ApiResponse<GalleryItem>>(API_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    return response.data.success
  } catch (error) {
    console.error("Error al subir archivo:", error)
    return false
  }
}
