import axios, { type AxiosInstance, type AxiosError } from 'axios'

const http: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach token if available
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gcs_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — normalize errors
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        localStorage.removeItem('gcs_token')
        console.warn('[GCS HTTP] 401 Unauthorized — token cleared')
      } else if (status === 403) {
        console.warn('[GCS HTTP] 403 Forbidden')
      } else if (status >= 500) {
        console.error('[GCS HTTP] Server error', status, error.response.data)
      }
    } else if (error.request) {
      console.warn('[GCS HTTP] Network error — backend unreachable')
    }
    return Promise.reject(error)
  }
)

export default http
