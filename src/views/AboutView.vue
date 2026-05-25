<script setup lang="ts">
import { ShieldCheck, Server, KeyRound, EyeOff } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-[calc(100vh-140px)] max-w-3xl mx-auto px-6 py-12 flex flex-col justify-center space-y-8">
    <div class="text-center space-y-3">
      <span class="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Arsitektur Aplikasi</span>
      <h1 class="text-4xl font-extrabold text-slate-100 tracking-tight">Tentang ArticleHub</h1>
      <p class="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
        Platform pengelolaan artikel berkinerja tinggi yang dirancang dengan memprioritaskan privasi data dan pertahanan XSS & CSRF yang solid.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
      <div class="border border-slate-900 bg-slate-900/20 p-6 rounded-2xl space-y-3">
        <div class="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-indigo-400 border border-slate-800 shadow-md">
          <KeyRound class="w-5 h-5" />
        </div>
        <h3 class="text-lg font-bold text-slate-200">Secure Cookie Storage</h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          Token JWT disimpan menggunakan penanganan Cookie Browser khusus dengan SameSite=Lax dan flag Secure otomatis di lingkungan HTTPS untuk mereduksi celah kerentanan XSS.
        </p>
      </div>

      <div class="border border-slate-900 bg-slate-900/20 p-6 rounded-2xl space-y-3">
        <div class="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-indigo-400 border border-slate-800 shadow-md">
          <ShieldCheck class="w-5 h-5" />
        </div>
        <h3 class="text-lg font-bold text-slate-200">Navigation Guards</h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          Sistem pembatasan rute Vue Router di tingkat klien yang memproteksi dashboard utama dari akses tidak sah dan mengalihkan pengguna terautentikasi keluar dari gerbang login.
        </p>
      </div>

      <div class="border border-slate-900 bg-slate-900/20 p-6 rounded-2xl space-y-3">
        <div class="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-indigo-400 border border-slate-800 shadow-md">
          <Server class="w-5 h-5" />
        </div>
        <h3 class="text-lg font-bold text-slate-200">Express REST API</h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          Integrasi mulus dengan backend server Node.js + Express menggunakan protokol HTTP client Axios terpusat beserta interceptor request dan response otomatis.
        </p>
      </div>

      <div class="border border-slate-900 bg-slate-900/20 p-6 rounded-2xl space-y-3">
        <div class="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-indigo-400 border border-slate-800 shadow-md">
          <EyeOff class="w-5 h-5" />
        </div>
        <h3 class="text-lg font-bold text-slate-200">Antarmuka Monokrom</h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          Desain modern gelap minimalis monokromatik beraksen Indigo lembut yang memanfaatkan kekuatan utilitas Tailwind CSS untuk kenyamanan membaca dalam waktu lama.
        </p>
      </div>
    </div>
  </div>
</template>
