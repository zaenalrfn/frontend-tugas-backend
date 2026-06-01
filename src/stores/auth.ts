import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import { getCookie, setCookie, deleteCookie } from '../utils/cookie'
import type { User, AuthResponse } from '../types'

export const useAuthStore = defineStore('auth', () => {
  // State: Inisialisasi awal membaca dari Cookie aman
  const initialToken = getCookie('token')
  const initialUser = getCookie('user')

  const token = ref<string>(initialToken || '')
  const user = ref<User | null>(initialUser ? JSON.parse(initialUser) : null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed<boolean>(() => !!token.value)

  // Helper: Dekode Payload JWT aman untuk UI
  const decodeJwt = (jwtToken: string): User => {
    try {
      const payloadBase64 = jwtToken.split('.')[1]
      if (!payloadBase64) {
        throw new Error('Format token JWT tidak valid')
      }
      const decodedJson = atob(payloadBase64)
      const parsed = JSON.parse(decodedJson)
      return {
        id: parsed.id,
        email: parsed.email,
        name: parsed.name,
      }
    } catch (e) {
      console.error('Gagal mendekode payload JWT:', e)
      return { id: '', email: '' }
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
