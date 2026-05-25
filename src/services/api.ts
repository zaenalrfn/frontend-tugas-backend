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
