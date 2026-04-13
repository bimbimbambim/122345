import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
})

api.interceptors.request.use((config) => {
  const initData = window.Telegram?.WebApp?.initData
  if (initData) {
    config.headers['X-Telegram-Init-Data'] = initData
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      'Произошла ошибка'
    return Promise.reject(new Error(message))
  }
)

export const apiRoutes = {
  auth: {
    init: () => api.post('/auth/init'),
  },
  user: {
    me: () => api.get('/users/me'),
    transactions: () => api.get('/users/transactions'),
    referrals: () => api.get('/users/referrals'),
  },
  generations: {
    create: (data: {
      style_id: string
      tier: string
      photo_base64: string
      init_data?: string
    }) => api.post('/generations', data),
    get: (id: string) => api.get(`/generations/${id}`),
    list: () => api.get('/generations'),
  },
  payments: {
    createInvoice: (data: {
      product_id: string
      product_type: 'coins' | 'subscription' | 'direct'
    }) => api.post('/payments/invoice', data),
    verify: (data: { payment_id: string }) => api.post('/payments/verify', data),
  },
  admin: {
    stats: () => api.get('/admin/stats'),
    users: (page?: number) => api.get(`/admin/users?page=${page || 1}`),
    generations: (page?: number) => api.get(`/admin/generations?page=${page || 1}`),
  },
}
