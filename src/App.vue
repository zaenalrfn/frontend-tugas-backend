<!-- File: src/App.vue -->
<script setup lang="ts">
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
    <!-- Navbar Premium Minimalis -->
    <header class="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div
            class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20"
          >
            A
          </div>
          <span class="font-bold text-slate-200 tracking-tight text-lg">ArticleHub</span>
        </router-link>

        <nav class="flex items-center gap-6 text-sm font-medium">
          <!-- Rute yang aman dan tervalidasi -->
          <router-link
            v-if="authStore.isAuthenticated"
            to="/"
            active-class="text-indigo-400 font-semibold"
            class="text-slate-400 hover:text-slate-200 transition-colors"
          >
            Home
          </router-link>
          <router-link
            v-else
            to="/login"
            active-class="text-indigo-400 font-semibold"
            class="text-slate-400 hover:text-slate-200 transition-colors"
          >
            Gerbang Masuk
          </router-link>
          <router-link
            to="/about"
            active-class="text-indigo-400 font-semibold"
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
