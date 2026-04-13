import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../api'

interface Gen {
  id: string; user_id: number; style_id: string; style_name: string
  tier: string; cost: number; status: string; images: string[]
  error_message: string | null; created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-emerald-500/15 text-emerald-400',
  pending:   'bg-yellow-500/15 text-yellow-400',
  processing:'bg-blue-500/15 text-blue-400',
  failed:    'bg-red-500/15 text-red-400',
}

export default function GenerationsPage() {
  const [gens, setGens] = useState<Gen[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<Gen | null>(null)

  const load = useCallback((p: number, s: string) => {
    setLoading(true)
    api.generations.list(p, s || undefined)
      .then(r => { setGens(r.data.generations); setTotal(r.data.total); setPages(r.data.pages) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(page, status) }, [page, load])

  const STATUSES = ['', 'completed', 'pending', 'processing', 'failed']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Генерации</h1>
          <p className="text-white/40 text-sm mt-0.5">{total.toLocaleString()} всего</p>
        </div>
        <div className="flex gap-2">
          {STATUSES.map(s => (
            <button key={s || 'all'}
              onClick={() => { setStatus(s); setPage(1); load(1, s) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                status === s ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                             : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/8'
              }`}>
              {s || 'Все'}
            </button>
          ))}
        </div>
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
                {['Стиль','Тир','Стоимость','Пользователь','Статус','Дата','Превью'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-white/30 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gens.map(g => (
                <tr key={g.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-semibold text-white">{g.style_name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-white/50 uppercase">{g.tier}</span>
                  </td>
                  <td className="px-4 py-3 text-yellow-400 font-bold">{g.cost}</td>
                  <td className="px-4 py-3 text-white/40 text-xs font-mono">#{g.user_id}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[g.status] || 'bg-white/10 text-white/40'}`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/30 text-xs">
                    {new Date(g.created_at).toLocaleString('ru-RU', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    {g.images?.length > 0 ? (
                      <button onClick={() => setPreview(g)}>
                        <img src={g.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover hover:scale-110 transition-transform" />
                      </button>
                    ) : g.error_message ? (
                      <span className="text-red-400/60 text-[10px] max-w-[120px] truncate block" title={g.error_message}>
                        {g.error_message}
                      </span>
                    ) : (
                      <span className="text-white/20 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center gap-2 mt-4 justify-center">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-sm disabled:opacity-30 hover:bg-white/5">← Назад</button>
          <span className="text-white/40 text-sm">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-sm disabled:opacity-30 hover:bg-white/5">Вперёд →</button>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setPreview(null)}>
          <div className="bg-[#161b27] border border-white/10 rounded-2xl p-4 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <p className="text-white font-bold mb-3">{preview.style_name} · {preview.tier}</p>
            <div className="grid grid-cols-2 gap-2">
              {preview.images.map((img, i) => (
                <img key={i} src={img} alt="" className="w-full rounded-xl object-cover aspect-square" />
              ))}
            </div>
            <button onClick={() => setPreview(null)} className="w-full mt-4 py-2 text-white/30 text-sm hover:text-white/60">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  )
}
