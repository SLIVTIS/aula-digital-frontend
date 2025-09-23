import { createRouter, createWebHistory } from 'vue-router'

const Login = () => import('@/views/Login.vue')
const Dashboard = () => import('@/views/Dashboard.vue')

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
  ],
})

export default router
