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
