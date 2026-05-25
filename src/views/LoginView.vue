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
      <div class="text-center">
        <div
          class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 mb-4 shadow-xl"
        >
          <Sparkles class="w-5 h-5" />
        </div>
        <h1 class="text-3xl font-bold text-slate-100 tracking-tight">Article Hub</h1>
        <p class="text-sm text-slate-400">Masuk untuk melihat dan menulis artikel terbaru</p>
      </div>

      <!-- Alert Notification Banner -->
      <div class="my-1 min-h-[56px]">
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
