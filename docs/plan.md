# Panduan Integrasi REST API ke Vue 3 (TypeScript + Pinia + Tailwind CSS + Secure Cookies)

Dokumen ini berisi panduan lengkap untuk menghubungkan backend REST API Express Anda dengan aplikasi frontend **Vue.js 3** menggunakan **TypeScript**, **Pinia** untuk manajemen state global, **Vue Router** untuk navigasi rute terlindungi, **Tailwind CSS** untuk UI modern monokromatik, dan **Secure Cookies** untuk penyimpanan token JWT secara lebih aman dari serangan XSS (_Cross-Site Scripting_).

---

## 📂 Struktur Folder Frontend Vue (Revisi Views & Cookie Utility)

Struktur direktori frontend ini memisahkan halaman **Login/Register** (`LoginView.vue`) dengan halaman **Dashboard Utama** (`HomeView.vue`) agar navigasi rute terlindungi dapat berjalan secara modular dan rapi:

```text
frontend-tugas-backend/
├── docs/
├── node_modules/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── main.css             # Konfigurasi Tailwind CSS & font global
│   ├── components/
│   │   ├── AlertMessage.vue     # Alert toast/banner minimalis
│   │   └── SkeletonLoader.vue   # Skeleton loader saat mengambil data
│   ├── router/
│   │   └── index.ts             # Routing & Navigation Guards (TypeScript)
│   ├── stores/
│   │   └── auth.ts              # Pinia Store untuk Autentikasi (Secure Cookies)
│   ├── services/
│   │   ├── api.ts               # Konfigurasi Axios + Interceptors (Membaca Cookie)
│   │   └── articles.ts          # Integrasi API CRUD artikel
│   ├── types/
│   │   └── index.ts             # TypeScript Interfaces & Types
│   ├── utils/
│   │   └── cookie.ts            # Utilitas Penanganan Cookie Aman (Secure, SameSite, Expires)
│   ├── views/
│   │   ├── AboutView.vue
│   │   ├── HomeView.vue         # Dashboard Feed Artikel (Hanya diakses setelah LOGIN)
│   │   └── LoginView.vue        # Halaman Gerbang Autentikasi (Tabbed Login/Register)
│   ├── App.vue                  # Main Entry Component
│   └── main.ts                  # Inisialisasi Aplikasi & Plugins
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js           # Konfigurasi kustom tema Tailwind
├── tsconfig.json
└── vite.config.ts
```

---

## 🍪 Langkah 1: Utilitas Penanganan Cookie Aman (`src/utils/cookie.ts`)

Menyimpan token di `localStorage` rentan terhadap pencurian token melalui serangan XSS. Dengan menyimpannya pada **Cookie** yang dilengkapi atribut keamanan seperti `SameSite=Lax` dan `Secure`, keamanan token meningkat drastis.

Buat berkas utilitas di **`src/utils/cookie.ts`**:

```typescript
// File: src/utils/cookie.ts

/**
 * Menyimpan data ke dalam cookie secara aman
 * @param name Nama key cookie
 * @param value Nilai yang ingin disimpan
 * @param days Masa berlaku cookie dalam hari (default 7 hari)
 */
export const setCookie = (name: string, value: string, days = 7): void => {
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()
  }

  // Deteksi protokol HTTPS untuk menerapkan atribut Secure
  const isSecure = window.location.protocol === 'https:'
  const secureAttr = isSecure ? '; Secure' : ''

  // Menggunakan SameSite=Lax untuk perlindungan dasar terhadap CSRF
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax${secureAttr}`
}

/**
 * Mengambil data dari cookie berdasarkan nama key
 * @param name Nama key cookie
 * @returns string | null
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length)
    }
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length))
    }
  }
  return null
}

/**
 * Menghapus cookie berdasarkan nama key
 * @param name Nama key cookie
 */
export const deleteCookie = (name: string): void => {
  // Set expired date ke masa lalu untuk memicu penghapusan otomatis oleh browser
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`
}
```

---

## 📡 Langkah 2: Setup HTTP Client Terpusat (`src/services/api.ts`)

Konfigurasikan Axios interceptor untuk membaca token JWT langsung dari **Cookie** menggunakan fungsi utilitas `getCookie`. Jika token kedaluwarsa (`401`/`403`), cookie akan dihapus dan user dialihkan ke halaman login.

```typescript
// File: src/services/api.ts
import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { getCookie, deleteCookie } from '../utils/cookie'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Otomatis mengambil JWT token dari Cookie aman
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCookie('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response Interceptor: Tangani sesi kedaluwarsa secara otomatis
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Hapus token & data user di Cookie jika terdeteksi tidak valid
      deleteCookie('token')
      deleteCookie('user')

      // Paksa navigasi ke gerbang login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
```

---

## 🏷️ Langkah 3: Model & Tipe Data TypeScript (`src/types/index.ts`)

```typescript
// File: src/types/index.ts

export interface User {
  id: number
  name?: string
  email: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: User
}

export interface Article {
  id: number
  title: string
  content: string
  author_id: number
  created_at?: string
  updated_at?: string
}

export interface ArticleResponse {
  success: boolean
  message: string
  data: Article | Article[]
}
```

---

## 💎 Langkah 4: State Management Autentikasi dengan Pinia (`src/stores/auth.ts`)

Ganti penggunaan `localStorage` dengan penulisan dan pembacaan via **Secure Cookie** (`getCookie`, `setCookie`, `deleteCookie`) untuk menjaga status login dan memproses JWT.

```typescript
// File: src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import { getCookie, setCookie, deleteCookie } from '../utils/cookie'
import type { User, AuthResponse } from '../types'

export const useAuthStore = defineStore('auth', () => {
  // State: Inisialisasi awal membaca dari Cookie aman
  const token = ref<string>(getCookie('token') || '')
  const user = ref<User | null>(getCookie('user') ? JSON.parse(getCookie('user')!) : null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed<boolean>(() => !!token.value)

  // Helper: Dekode Payload JWT aman untuk UI
  const decodeJwt = (jwtToken: string): User => {
    try {
      const payloadBase64 = jwtToken.split('.')[1]
      const decodedJson = atob(payloadBase64)
      const parsed = JSON.parse(decodedJson)
      return {
        id: parsed.id,
        email: parsed.email,
        name: parsed.name,
      }
    } catch (e) {
      console.error('Gagal mendekode payload JWT:', e)
      return { id: 0, email: '' }
    }
  }

  // Actions
  const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<AuthResponse>('/api/auth/register', { name, email, password })
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registrasi akun gagal'
      throw err
    } finally {
      loading.value = false
    }
  }

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', { email, password })
      const responseData = response.data

      if (responseData.token) {
        token.value = responseData.token
        // Simpan token ke Cookie aman selama 7 hari
        setCookie('token', responseData.token, 7)

        // Ekstraksi data pengguna dari token & simpan ke Cookie
        const parsedUser = decodeJwt(responseData.token)
        user.value = parsedUser
        setCookie('user', JSON.stringify(parsedUser), 7)
      }
      return responseData
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Email atau kata sandi salah'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    loading.value = true
    try {
      await api.post('/api/auth/logout')
    } catch (err) {
      console.warn('Gagal memproses logout backend, menghapus sesi lokal...', err)
    } finally {
      // Bersihkan Cookie & State secara total
      token.value = ''
      user.value = null
      deleteCookie('token')
      deleteCookie('user')
      loading.value = false
    }
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
  }
})
```

---

## 📝 Langkah 5: Layanan API CRUD Artikel (`src/services/articles.ts`)

```typescript
// File: src/services/articles.ts
import api from './api'
import type { Article, ArticleResponse } from '../types'

export const articleService = {
  async getAll(): Promise<Article[]> {
    const response = await api.get<ArticleResponse>('/api/articles')
    if (Array.isArray(response.data.data)) {
      return response.data.data
    }
    return []
  },

  async getById(id: number): Promise<Article> {
    const response = await api.get<ArticleResponse>(`/api/articles/${id}`)
    return response.data.data as Article
  },

  async create(title: string, content: string): Promise<Article> {
    const response = await api.post<ArticleResponse>('/api/articles', { title, content })
    return response.data.data as Article
  },
}
```

---

## 🚦 Langkah 6: Konfigurasi Rute & Navigation Guards (`src/router/index.ts`)

Implementasikan pemisahan visual:

- `/login` untuk tamu (guest) yang ingin login/register.
- `/` (HomeView) sebagai dashboard utama yang **wajib terautentikasi** (`meta: { requiresAuth: true }`).

```typescript
// File: src/router/index.ts
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
```

---

## 🖥️ Langkah 7: Pembaruan Tampilan Views (Tailwind CSS)

### 1. Halaman Login/Register Bertab Tunggal (`src/views/LoginView.vue`)

Halaman ini didedikasikan sepenuhnya untuk otentikasi tamu dengan transisi mulus dan layout glassmorphism monokrom.

```vue
<!-- File: src/views/LoginView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Mail, Lock, User as UserIcon, ArrowRight, Sparkles } from 'lucide-vue-next'
import AlertMessage from '../components/AlertMessage.vue'

const authStore = useAuthStore()
const router = useRouter()

// State Form
const activeTab = ref<'login' | 'register'>('login')
const name = ref('')
const email = ref('')
const password = ref('')
const notification = ref<{ type: 'success' | 'error'; message: string } | null>(null)

const triggerNotification = (type: 'success' | 'error', message: string) => {
  notification.value = { type, message }
  setTimeout(() => {
    notification.value = null
  }, 4000)
}

const handleLogin = async () => {
  if (!email.value || !password.value) return
  try {
    await authStore.login(email.value, password.value)
    triggerNotification('success', 'Berhasil masuk! Mengalihkan ke dashboard...')
    setTimeout(() => {
      router.push({ name: 'home' })
    }, 1000)
  } catch (err: any) {
    triggerNotification(
      'error',
      authStore.error || 'Gagal masuk. Periksa kembali email & password Anda.',
    )
  }
}

const handleRegister = async () => {
  if (!name.value || !email.value || !password.value) return
  try {
    await authStore.register(name.value, email.value, password.value)
    triggerNotification('success', 'Akun berhasil didaftarkan! Silakan masuk.')
    activeTab.value = 'login'
    name.value = ''
    password.value = ''
  } catch (err: any) {
    triggerNotification(
      'error',
      authStore.error || 'Pendaftaran gagal. Email mungkin sudah terdaftar.',
    )
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-6">
    <div class="w-full max-w-md">
      <!-- Title Header Premium -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 mb-4 shadow-xl"
        >
          <Sparkles class="w-5 h-5" />
        </div>
        <h1 class="text-3xl font-bold text-slate-100 tracking-tight">Article Hub</h1>
        <p class="text-sm text-slate-400 mt-2">Masuk untuk melihat dan menulis artikel terbaru</p>
      </div>

      <!-- Alert Notification Banner -->
      <div class="mb-4 min-h-[56px]">
        <Transition
          enter-active-class="transform ease-out duration-300 transition"
          enter-from-class="translate-y-2 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <AlertMessage
            v-if="notification"
            :type="notification.type"
            :message="notification.message"
          />
        </Transition>
      </div>

      <!-- Unified Authentication Card -->
      <div
        class="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 shadow-2xl"
      >
        <!-- Switcher Tab Minimalis -->
        <div class="flex border-b border-slate-800/80 pb-4 mb-6">
          <button
            @click="activeTab = 'login'"
            :class="[
              'flex-1 pb-2 text-sm font-semibold text-center transition-all border-b-2 outline-none',
              activeTab === 'login'
                ? 'border-indigo-500 text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-300',
            ]"
          >
            Masuk Sesi
          </button>
          <button
            @click="activeTab = 'register'"
            :class="[
              'flex-1 pb-2 text-sm font-semibold text-center transition-all border-b-2 outline-none',
              activeTab === 'register'
                ? 'border-indigo-500 text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-300',
            ]"
          >
            Buat Akun
          </button>
        </div>

        <!-- FORM TAB: LOGIN -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
              >Email Address</label
            >
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail class="w-4 h-4" />
              </span>
              <input
                v-model="email"
                type="email"
                required
                class="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
                placeholder="developer@app.com"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
              >Password</label
            >
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock class="w-4 h-4" />
              </span>
              <input
                v-model="password"
                type="password"
                required
                class="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full mt-2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-[0.98] text-sm shadow-lg shadow-indigo-600/10"
          >
            {{ authStore.loading ? 'Sedang Otentikasi...' : 'Masuk Sesi' }}
            <ArrowRight v-if="!authStore.loading" class="w-4 h-4" />
          </button>
        </form>

        <!-- FORM TAB: REGISTER -->
        <form v-else @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
              >Nama Lengkap</label
            >
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <UserIcon class="w-4 h-4" />
              </span>
              <input
                v-model="name"
                type="text"
                required
                class="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
                placeholder="Developer Handal"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
              >Email Address</label
            >
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail class="w-4 h-4" />
              </span>
              <input
                v-model="email"
                type="email"
                required
                class="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
                placeholder="developer@app.com"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
              >Password</label
            >
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock class="w-4 h-4" />
              </span>
              <input
                v-model="password"
                type="password"
                required
                class="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full mt-2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-[0.98] text-sm shadow-lg shadow-indigo-600/10"
          >
            {{ authStore.loading ? 'Mendaftarkan Akun...' : 'Daftarkan Akun Baru' }}
            <ArrowRight v-if="!authStore.loading" class="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
```

### 2. Halaman Dashboard CRUD Terlindungi (`src/views/HomeView.vue`)

Halaman utama ini bertindak sebagai ruang kontrol CRUD artikel tertutup yang hanya dapat dirender setelah pengguna lolos verifikasi Navigation Guard.

```vue
<!-- File: src/views/HomeView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { articleService } from '../services/articles'
import type { Article } from '../types'
import { LogOut, PlusCircle, BookOpen, User as UserIcon, FileText } from 'lucide-vue-next'
import AlertMessage from '../components/AlertMessage.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'

const authStore = useAuthStore()
const router = useRouter()

// State CRUD Artikel
const articles = ref<Article[]>([])
const newTitle = ref('')
const newContent = ref('')
const isSubmitting = ref(false)
const isLoadingArticles = ref(false)
const notification = ref<{ type: 'success' | 'error'; message: string } | null>(null)

const triggerNotification = (type: 'success' | 'error', message: string) => {
  notification.value = { type, message }
  setTimeout(() => {
    notification.value = null
  }, 4000)
}

// Pemuatan data dari API
const loadArticles = async () => {
  isLoadingArticles.value = true
  try {
    articles.value = await articleService.getAll()
  } catch (err) {
    triggerNotification('error', 'Gagal menyinkronkan data feed artikel.')
  } finally {
    isLoadingArticles.value = false
  }
}

// Pembuatan artikel baru
const handleSubmitArticle = async () => {
  if (!newTitle.value || !newContent.value) return
  isSubmitting.value = true
  try {
    await articleService.create(newTitle.value, newContent.value)
    triggerNotification('success', 'Artikel baru berhasil dipublikasikan!')
    newTitle.value = ''
    newContent.value = ''
    await loadArticles()
  } catch (err: any) {
    triggerNotification('error', err.response?.data?.message || 'Gagal mempublikasikan artikel.')
  } finally {
    isSubmitting.value = false
  }
}

// Logout / Pemutusan Sesi
const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'login' })
}

onMounted(() => {
  loadArticles()
})
</script>

<template>
  <div class="min-h-[calc(100vh-140px)] max-w-5xl mx-auto px-6 py-8 space-y-8">
    <!-- Notification Banner -->
    <div class="fixed top-6 right-6 z-50 w-full max-w-sm">
      <Transition
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <AlertMessage
          v-if="notification"
          :type="notification.type"
          :message="notification.message"
        />
      </Transition>
    </div>

    <!-- Dashboard Top Header -->
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-6 gap-4"
    >
      <div>
        <span class="text-xs text-indigo-400 font-semibold uppercase tracking-wider"
          >Dashboard Kontrol</span
        >
        <h2 class="text-2xl font-bold text-slate-100 flex items-center gap-2 mt-0.5">
          Selamat datang, {{ authStore.user?.email }}
        </h2>
      </div>
      <button
        @click="handleLogout"
        class="flex items-center gap-2 text-xs font-semibold border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl transition-all duration-200"
      >
        <LogOut class="w-4 h-4 text-rose-500" />
        Keluar Sesi
      </button>
    </div>

    <!-- Main Layout Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- FORM COLUMN: POST ARTIKEL BARU -->
      <section class="lg:col-span-5">
        <div
          class="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-5 sticky top-24"
        >
          <div class="flex items-center gap-2.5 pb-3 border-b border-slate-800/60">
            <PlusCircle class="w-5 h-5 text-indigo-400" />
            <h3 class="font-bold text-slate-200">Tulis Artikel Baru</h3>
          </div>

          <form @submit.prevent="handleSubmitArticle" class="space-y-4">
            <div>
              <label
                class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
                >Judul Artikel</label
              >
              <input
                v-model="newTitle"
                type="text"
                required
                placeholder="Masukkan tajuk utama..."
                class="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
              />
            </div>

            <div>
              <label
                class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
                >Konten Tulisan</label
              >
              <textarea
                v-model="newContent"
                required
                rows="6"
                placeholder="Tulis gagasan Anda secara komprehensif..."
                class="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3 text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 text-sm"
            >
              {{ isSubmitting ? 'Mempublikasikan...' : 'Terbitkan Artikel' }}
            </button>
          </form>
        </div>
      </section>

      <!-- FEED COLUMN: DAFTAR ARTIKEL -->
      <section class="lg:col-span-7 space-y-4">
        <div class="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-6">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div class="flex items-center gap-2.5">
              <BookOpen class="w-5 h-5 text-indigo-400" />
              <h3 class="font-bold text-slate-200">Feed Artikel Terbaru</h3>
            </div>
            <span
              class="text-xs px-2.5 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-semibold"
            >
              {{ articles.length }} Artikel
            </span>
          </div>

          <!-- Loader State -->
          <div v-if="isLoadingArticles" class="space-y-6">
            <SkeletonLoader />
            <SkeletonLoader />
          </div>

          <!-- Empty State -->
          <div
            v-else-if="articles.length === 0"
            class="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800 rounded-xl"
          >
            <div
              class="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-slate-600 mb-3 border border-slate-800"
            >
              <FileText class="w-5 h-5" />
            </div>
            <p class="text-sm text-slate-400 font-medium">Belum ada artikel terkini</p>
            <p class="text-xs text-slate-600 mt-1">
              Mulai terbitkan artikel pertama Anda di panel menulis.
            </p>
          </div>

          <!-- List State -->
          <div v-else class="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            <div
              v-for="article in articles"
              :key="article.id"
              class="group border border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/70 p-5 rounded-xl transition-all duration-200"
            >
              <div class="flex items-start justify-between gap-4">
                <h4 class="font-bold text-slate-100 group-hover:text-white transition-colors">
                  {{ article.title }}
                </h4>
                <span
                  class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/30"
                >
                  ID: {{ article.id }}
                </span>
              </div>
              <p class="text-sm text-slate-400 mt-2 leading-relaxed whitespace-pre-line">
                {{ article.content }}
              </p>
              <div
                class="flex items-center gap-2 mt-4 pt-3 border-t border-slate-900 text-xs text-slate-500"
              >
                <UserIcon class="w-3.5 h-3.5" />
                <span>Author ID: {{ article.author_id }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
```

### 3. Komponen Pembungkus Utama (`src/App.vue`)

```vue
<!-- File: src/App.vue -->
<script setup lang="ts">
import { useAuthStore } from './stores/auth'
import { LogOut } from 'lucide-vue-next'

const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
    <!-- Navbar Premium Minimalis -->
    <header class="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div
            class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20"
          >
            A
          </div>
          <span class="font-bold text-slate-200 font-display tracking-tight text-lg"
            >ArticleHub</span
          >
        </router-link>

        <nav class="flex items-center gap-6 text-sm font-medium">
          <!-- Rute yang aman dan tervalidasi -->
          <router-link
            v-if="authStore.isAuthenticated"
            to="/"
            active-class="text-indigo-400"
            class="text-slate-400 hover:text-slate-200 transition-colors"
          >
            Dashboard Feed
          </router-link>
          <router-link
            v-else
            to="/login"
            active-class="text-indigo-400"
            class="text-slate-400 hover:text-slate-200 transition-colors"
          >
            Gerbang Masuk
          </router-link>
          <router-link
            to="/about"
            active-class="text-indigo-400"
            class="text-slate-400 hover:text-slate-200 transition-colors"
          >
            Tentang
          </router-link>
        </nav>
      </div>
    </header>

    <!-- Content Router Wrapper -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Footer Tipis Minimalis -->
    <footer class="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
      <div
        class="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2"
      >
        <span>© 2026 ArticleHub. Hak Cipta Dilindungi.</span>
        <span>Integrasi Express REST API + Cookie Otorisasi Aman</span>
      </div>
    </footer>
  </div>
</template>
```

---

## ⚡ Langkah 8: Inisialisasi Klien Utama (`src/main.ts`)

```typescript
// File: src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css' // Import base Tailwind CSS

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

---

## 🔒 Ringkasan Peningkatan Keamanan Cookie & Rute Views

1. **Mencegah Serangan XSS**: Dengan memigrasikan penyimpanan token JWT dari `localStorage` ke **Cookie Browser**, token Anda terlindung dari akses skrip JavaScript berbahaya (salah satu kelemahan utama penyimpanan berbasis penyimpanan lokal).
2. **SameSite & Secure Flags**: Cookie diformat dengan atribut `SameSite=Lax` untuk mencegah penipuan permintaan lintas-situs (CSRF) saat integrasi CORS berlangsung, serta secara dinamis menambahkan atribut `Secure` jika server dijalankan pada lingkungan HTTPS.
3. **Pemisahan Views Bersih**: Memecah tampilan menjadi `LoginView.vue` (tamu saja) dan `HomeView.vue` (dashboard internal) memudahkan Anda dalam mengimplementasikan logika kontrol di tingkat Router secara terpusat, alih-alih meletakkan logika kondisional di dalam satu file komponen yang rentan berantakan.
