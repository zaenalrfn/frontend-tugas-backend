import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }, // Wajib login untuk masuk ke dashboard utama
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true }, // Hanya untuk pengguna yang belum login
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation Guard: Lindungi rute rahasia dan batasi akses login bagi yang sudah masuk
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Pengguna belum login mencoba masuk halaman steril -> arahkan ke /login
    next({ name: 'login' })
  } else if (to.meta.guestOnly && authStore.isAuthenticated) {
    // Pengguna sudah login mencoba masuk ke halaman login kembali -> arahkan ke dashboard /
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
