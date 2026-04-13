import React, { useState } from 'react'
import { api } from '../api'

export default function Login({ onLogin }: { onLogin: (t: string) => void }) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.login({ admin_token: token })
      onLogin(res.data.token)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg || 'Неверный токен')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-1" style={{
            background: 'linear-gradient(135deg,#D4AF37,#F5D85A)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            LENSY Admin
          </h1>
          <p className="text-white/40 text-sm">Панель управления</p>
        </div>

        <form onSubmit={submit}
          className="bg-[#161b27] border border-white/[0.08] rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
              Admin Token
            </label>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Введите токен администратора"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-yellow-500/50 focus:bg-white/8 transition-all"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!token || loading}
            className="w-full py-3 rounded-xl font-bold text-sm text-black transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#D4AF37,#F5D85A)' }}>
            {loading ? 'Вход...' : 'Войти'}
          </button>

          <p className="text-white/20 text-xs text-center">
            Доступ только для авторизованных администраторов
          </p>
        </form>
      </div>
    </div>
  )
}
