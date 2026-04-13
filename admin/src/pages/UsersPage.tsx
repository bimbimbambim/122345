import React, { useEffect, useState, useCallback } from 'react'
import { Search, Ban, Coins, ShieldCheck, ShieldOff } from 'lucide-react'
import { api } from '../api'

interface UserRow {
  id: number; telegram_id: string; username: string | null
  first_name: string | null; fire_coins: number; total_generations: number
  subscription: string | null; is_admin: boolean; is_banned: boolean; created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionUser, setActionUser] = useState<UserRow | null>(null)
  const [coinsAmount, setCoinsAmount] = useState(50)

  const load = useCallback((p: number, q: string) => {
    setLoading(true)
    api.users.list(p, q || undefined)
      .then(r => { setUsers(r.data.users); setTotal(r.data.total); setPages(r.data.pages) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(page, search) }, [page, load])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); setPage(1); load(1, search)
  }

  const doAction = async (userId: number, action: string, value?: number) => {
    await api.users.action(userId, action, value)
    setActionUser(null)
    load(page, search)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Пользователи</h1>
          <p className="text-white/40 text-sm mt-0.5">{total.toLocaleString()} зарегистрировано</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Имя, username, TG ID..."
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm w-56 focus:outline-none focus:border-yellow-500/40"
          />
          <button type="submit" className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-[#161b27] border border-white/[0.07] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Пользователь','TG ID','Монеты','Генераций','Подписка','Статус','Действия'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-white/30 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{u.first_name || '—'}</p>
                    <p className="text-white/30 text-xs">{u.username ? `@${u.username}` : 'no username'}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-white/40">{u.telegram_id}</td>
                  <td className="px-4 py-3 text-yellow-400 font-bold">{u.fire_coins}</td>
                  <td className="px-4 py-3 text-white/60">{u.total_generations}</td>
                  <td className="px-4 py-3">
                    {u.subscription
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/15 text-yellow-400">{u.subscription}</span>
                      : <span className="text-white/20 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {u.is_banned && <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/15 text-red-400">banned</span>}
                      {u.is_admin  && <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/15 text-purple-400">admin</span>}
                      {!u.is_banned && !u.is_admin && <span className="text-white/20 text-xs">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setActionUser(u)} className="text-white/30 hover:text-white/70 text-xs px-2 py-1 rounded border border-white/10 hover:border-white/25 transition-all">
                      Управление
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center gap-2 mt-4 justify-center">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-sm disabled:opacity-30 hover:bg-white/5">← Назад</button>
          <span className="text-white/40 text-sm">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-sm disabled:opacity-30 hover:bg-white/5">Вперёд →</button>
        </div>
      )}

      {/* Action modal */}
      {actionUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setActionUser(null)}>
          <div className="bg-[#161b27] border border-white/10 rounded-2xl p-6 w-80" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-white mb-1">{actionUser.first_name || actionUser.telegram_id}</h2>
            <p className="text-white/30 text-xs mb-5">{actionUser.username ? `@${actionUser.username}` : ''} · TG {actionUser.telegram_id}</p>

            <div className="space-y-2">
              <button onClick={() => doAction(actionUser.id, actionUser.is_banned ? 'unban' : 'ban')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  actionUser.is_banned ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}>
                <Ban className="w-4 h-4" />
                {actionUser.is_banned ? 'Разблокировать' : 'Заблокировать'}
              </button>

              <button onClick={() => doAction(actionUser.id, actionUser.is_admin ? 'revoke_admin' : 'set_admin')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all">
                {actionUser.is_admin ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                {actionUser.is_admin ? 'Снять права' : 'Дать права'} администратора
              </button>

              <div className="flex gap-2 mt-1">
                <input type="number" value={coinsAmount} onChange={e => setCoinsAmount(+e.target.value)} min={1} max={10000}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                <button onClick={() => doAction(actionUser.id, 'add_coins', coinsAmount)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-all">
                  <Coins className="w-4 h-4" /> Начислить
                </button>
              </div>
            </div>

            <button onClick={() => setActionUser(null)} className="w-full mt-4 py-2 text-white/30 text-sm hover:text-white/60">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  )
}
