<!-- File: src/views/ArticleDetailView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { articleService } from '../services/articles'
import type { Article } from '../types'
import { ArrowLeft, User as UserIcon, Calendar, Clock, BookOpen, AlertCircle } from 'lucide-vue-next'
import AlertMessage from '../components/AlertMessage.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'

const route = useRoute()
const router = useRouter()

const article = ref<Article | null>(null)
const isLoading = ref(true)
const errorMsg = ref<string | null>(null)

const fetchArticle = async () => {
  isLoading.value = true
  errorMsg.value = null
  try {
    const id = route.params.id as string
    if (!id) {
      throw new Error('Identifikasi artikel tidak valid.')
    }
    article.value = await articleService.getById(id)
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || err.message || 'Gagal mengambil rincian data artikel.'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return null
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateStr
  }
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  fetchArticle()
})
</script>

<template>
  <div class="min-h-[calc(100vh-140px)] max-w-4xl mx-auto px-6 py-10 space-y-8">
    
    <!-- Tombol Kembali Premium -->
    <div class="flex items-center justify-between">
      <button
        @click="goBack"
        class="group flex items-center gap-2.5 text-sm font-semibold border border-slate-900 bg-slate-950/40 hover:bg-slate-900/80 hover:border-slate-800 text-slate-400 hover:text-white px-5 py-3 rounded-2xl transition-all duration-300"
      >
        <ArrowLeft class="w-4 h-4 text-indigo-400 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Feed
      </button>
      
      <span
        v-if="article"
        class="text-xs px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-semibold"
      >
        Artikel ID: {{ article.id }}
      </span>
    </div>

    <!-- STATE: LOADING -->
    <div v-if="isLoading" class="space-y-6">
      <div class="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 space-y-6 animate-pulse">
        <div class="h-8 bg-slate-800 rounded-xl w-3/4"></div>
        <div class="flex gap-4 border-b border-slate-800/60 pb-6">
          <div class="h-4 bg-slate-800 rounded-lg w-24"></div>
          <div class="h-4 bg-slate-800 rounded-lg w-32"></div>
        </div>
        <div class="space-y-3">
          <div class="h-4 bg-slate-800 rounded-lg w-full"></div>
          <div class="h-4 bg-slate-800 rounded-lg w-full"></div>
          <div class="h-4 bg-slate-800 rounded-lg w-5/6"></div>
          <div class="h-4 bg-slate-800 rounded-lg w-2/3"></div>
        </div>
      </div>
    </div>

    <!-- STATE: ERROR -->
    <div v-else-if="errorMsg" class="space-y-6">
      <div class="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 text-center space-y-6">
        <div class="mx-auto w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
          <AlertCircle class="w-7 h-7 text-rose-400" />
        </div>
        <div class="space-y-2">
          <h3 class="text-xl font-bold text-slate-100">Gagal Membuka Artikel</h3>
          <p class="text-sm text-slate-400 max-w-md mx-auto">
            {{ errorMsg }}
          </p>
        </div>
        <div class="flex items-center justify-center gap-4 pt-2">
          <button
            @click="fetchArticle"
            class="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
          >
            Coba Sinkronkan Kembali
          </button>
          <button
            @click="goBack"
            class="px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white transition-all"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>

    <!-- STATE: ARTIKEL DETAIL READY -->
    <article
      v-else-if="article"
      class="bg-slate-900/20 border border-slate-800/60 rounded-3xl p-8 lg:p-10 space-y-8 backdrop-blur-md shadow-2xl relative overflow-hidden"
    >
      <!-- Background Ambient Glow -->
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Header Content -->
      <div class="space-y-4 border-b border-slate-800/80 pb-6 relative z-10">
        <div class="flex items-center gap-2 text-xs text-indigo-400 font-bold uppercase tracking-wider">
          <BookOpen class="w-3.5 h-3.5" />
          <span>Esai Komprehensif</span>
        </div>
        
        <h1 class="text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
          {{ article.title }}
        </h1>

        <!-- Metadata Section -->
        <div class="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-xs text-slate-400 font-medium">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-300">
              <UserIcon class="w-3 h-3" />
            </div>
            <span>Kontributor ID: <strong class="text-slate-300 font-semibold">{{ article.author_id }}</strong></span>
          </div>

          <div v-if="formatDate(article.created_at)" class="flex items-center gap-2">
            <Calendar class="w-3.5 h-3.5 text-slate-500" />
            <span>Terbit: <span class="text-slate-300">{{ formatDate(article.created_at) }}</span></span>
          </div>

          <div v-if="article.updated_at && article.updated_at !== article.created_at" class="flex items-center gap-2">
            <Clock class="w-3.5 h-3.5 text-slate-500" />
            <span>Diperbarui: <span class="text-slate-300">{{ formatDate(article.updated_at) }}</span></span>
          </div>
        </div>
      </div>

      <!-- Main Article Body -->
      <div class="relative z-10">
        <p class="text-base text-slate-300 leading-relaxed lg:leading-loose whitespace-pre-line font-normal tracking-wide">
          {{ article.content }}
        </p>
      </div>

      <!-- Footer Info -->
      <div class="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 relative z-10">
        <span>Dibaca di ArticleHub Platform</span>
        <span class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Tersinkronisasi dengan Backend API
        </span>
      </div>
    </article>
  </div>
</template>
