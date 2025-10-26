import AnnouncementHistory from '@/views/AnnouncementHistory.vue'
import { createRouter, createWebHistory } from 'vue-router'

const Login = () => import('@/views/Login.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const UserManagement = () => import('@/views/UserManagement.vue')
const AvisosCentralizados = () => import('@/views/AvisosCentralizadosView.vue') //importar vista de avisos centralizados//
const CreateAnnouncement = () => import('@/views/CreateAnnouncement.vue')
const AnnouncementDetail = () => import('@/views/AnnouncementDetail.vue')
const GalleryView = () => import('@/views/GalleryView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        requiresAuth: false,
        title: 'Iniciar Sesión'
      }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: {
        requiresAuth: true,
        roles: ['admin', 'teacher', 'parent'],
        title: 'Panel Principal'
      }
    },
    {
      path: '/users',
      name: 'UserManagement',
      component: UserManagement,
      meta: {
        requiresAuth: true,
        roles: ['admin'],
        title: 'Gestión de Usuarios'
      }
    },
    {
      path: '/announcements',
      name: 'AvisosCentralizados',
      component: AvisosCentralizados,
      meta: {
        requiresAuth: true,
        roles: ['admin', 'teacher'],
        title: 'Avisos Centralizados'
      }
    },
    {
      path: '/announcements/:id',
      name: 'AnnouncementDetail',
      component: AnnouncementDetail,
      meta: {
        requiresAuth: true,
        roles: ['admin', 'teacher', 'parent'],
        title: 'Detalle del Aviso'
      }
    },
    {
      path: '/announcements/create',
      name: 'CreateAnnouncement',
      component: CreateAnnouncement,
      meta: {
        requiresAuth: true,
        roles: ['admin', 'teacher'],
        title: 'Crear Aviso'
      }
    },
    {
      path: '/announcements/history',
      name: 'AnnouncementHistory',
      component: AnnouncementHistory,
      meta: {
        requiresAuth: true,
        roles: ['admin', 'teacher'],
        title: 'Crear Aviso'
      }
    },
    {
      path: '/gallery',
      name: 'Gallery',
      component: GalleryView,
      meta: {
        requiresAuth: true,
        roles: ['admin', 'teacher', 'parent'],
        title: 'Galería Multimedia'
      }
    }
  ]
})

export default router
