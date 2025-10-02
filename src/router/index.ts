import { createRouter, createWebHistory } from 'vue-router'

const Login = () => import('@/views/Login.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const UserManagement = () => import('@/views/UserManagement.vue')
const AvisosCentralizados = () => import('@/views/AvisosCentralizadosView.vue') //importar vista de avisos centralizados//


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
  path: '/avisos',
  name: 'AvisosCentralizados',
  component: AvisosCentralizados,
  meta: {
    requiresAuth: true,
    roles: ['admin', 'teacher'],
    title: 'Avisos Centralizados'
  }
}

  ],
})

export default router
