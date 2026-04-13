import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

const http = axios.create({ baseURL: BASE })

http.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('admin_token')
  if (token) cfg.headers['Authorization'] = `Bearer ${token}`
  return cfg
})

export const api = {
  login: (data: { admin_token?: string; init_data?: string }) =>
    http.post('/api/admin/login', data),

  stats: () => http.get('/api/admin/stats'),

  styles: {
    list: () => http.get('/api/admin/styles'),
    create: (data: object) => http.post('/api/admin/styles', data),
    update: (id: string, data: object) => http.put(`/api/admin/styles/${id}`, data),
    delete: (id: string) => http.delete(`/api/admin/styles/${id}`),
  },

  users: {
    list: (page: number, search?: string) =>
      http.get('/api/admin/users', { params: { page, search } }),
    action: (userId: number, action: string, value?: number) =>
      http.post(`/api/admin/users/${userId}/action`, { action, value }),
  },

  generations: {
    list: (page: number, status?: string) =>
      http.get('/api/admin/generations', { params: { page, status } }),
  },
}
