import React, { useEffect, useState } from 'react'
import { Users, ImageIcon, CreditCard, TrendingUp, Palette, CheckCircle } from 'lucide-react'
import { api } from '../api'

interface Stats {
  total_users: number
  total_generations: number
  completed_generations: number
  active_subscriptions: number
  total_revenue_rub: number
  total_styles: number
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.FC<{ className?: string }>
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="bg-[#161b27] border border-white/[0.07] rounded-xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-white/40 text-xs font-medium">{label}</p>
        <p className="text-white text-xl font-black mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.stats()
      .then(r => setStats(r.data))
      .catch(() => setError('Ошибка загрузки. Проверьте подключение к серверу.'))
  }, [])

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  )

  if (!stats) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
    </div>
  )

  const completionRate = stats.total_generations > 0
    ? Math.round(stats.completed_generations / stats.total_generations * 100)
    : 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Общая статистика проекта</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard icon={Users}        label="Пользователей"     value={stats.total_users.toLocaleString()} color="bg-blue-500/15 text-blue-400" />
        <StatCard icon={ImageIcon}    label="Генераций всего"   value={stats.total_generations.toLocaleString()} color="bg-purple-500/15 text-purple-400" />
        <StatCard icon={CheckCircle}  label="Успешных"          value={`${stats.completed_generations} (${completionRate}%)`} color="bg-emerald-500/15 text-emerald-400" />
        <StatCard icon={CreditCard}   label="Подписок активных" value={stats.active_subscriptions.toLocaleString()} color="bg-yellow-500/15 text-yellow-400" />
        <StatCard icon={TrendingUp}   label="Выручка"           value={`${stats.total_revenue_rub.toLocaleString()} ₽`} color="bg-green-500/15 text-green-400" />
        <StatCard icon={Palette}      label="Активных стилей"   value={stats.total_styles.toLocaleString()} color="bg-pink-500/15 text-pink-400" />
      </div>
    </div>
  )
}
