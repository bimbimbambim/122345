import { useEffect, useState } from 'react'
import { X, Download, Share2, RefreshCw, Crown, Sparkles, ImageIcon, Flame } from 'lucide-react'
import { apiRoutes } from '../api/client'
import type { Generation } from '../types'
import { useStore } from '../store/useStore'
import { useTelegram } from '../hooks/useTelegram'
import { STYLES } from '../data/styles'

export function Sessions() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Generation | null>(null)
  const { openPaywall, setSelectedStyle, openUpload } = useStore()
  const { haptic, tg } = useTelegram()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiRoutes.generations.list()
        setGenerations(res.data)
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [])

  const handleSave = (url: string) => {
    haptic.medium()
    const a = document.createElement('a')
    a.href = url; a.download = 'lensy-ai-photo.jpg'; a.target = '_blank'; a.click()
  }

  const handleShare = (url: string) => {
    haptic.medium()
    if (navigator.share) navigator.share({ url, title: 'Моя AI фотосессия от LENSY AI' })
    else if (tg) tg.openLink(url)
  }

  const tierMeta = (tier: string) => ({
    fast:     { label: 'FAST',     bg: 'rgba(59,130,246,0.15)',    color: 'rgba(96,165,250,1)',   border: 'rgba(59,130,246,0.3)' },
    premium:  { label: 'PREMIUM',  bg: 'rgba(212,175,55,0.15)',    color: 'rgba(212,175,55,1)',   border: 'rgba(212,175,55,0.35)' },
    standard: { label: 'STANDARD', bg: 'rgba(255,255,255,0.07)',   color: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.1)' },
  }[tier] ?? { label: tier.toUpperCase(), bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.1)' })

  const statusMeta = (s: string) => ({
    completed:  { label: 'Готово',       color: 'rgba(34,197,94,1)',   bg: 'rgba(34,197,94,0.12)',   dot: 'bg-emerald-400' },
    failed:     { label: 'Ошибка',       color: 'rgba(239,68,68,1)',   bg: 'rgba(239,68,68,0.12)',   dot: 'bg-red-400' },
    processing: { label: 'Генерация…',  color: 'rgba(251,191,36,1)',  bg: 'rgba(251,191,36,0.12)',  dot: 'bg-yellow-400 animate-pulse' },
  }[s] ?? { label: 'Ожидание', color: 'rgba(255,255,255,0.35)', bg: 'rgba(255,255,255,0.07)', dot: 'bg-white/30' })

  return (
    <div className="flex flex-col min-h-screen bg-app-bg pb-28">

      {/* ── Header ───────────────────────────────────── */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-black text-white tracking-tight">Фотосессии</h1>
          <p className="text-white/35 text-[12px] mt-0.5">
            {loading ? 'Загрузка…' : `${generations.length} генераций`}
          </p>
        </div>
        {!loading && generations.length > 0 && (
          <div className="px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <span className="text-white/40 text-[12px] font-bold tabular-nums">{generations.length}</span>
          </div>
        )}
      </div>

      {/* ── Loading skeletons ────────────────────────── */}
      {loading && (
        <div className="px-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-[18px] shimmer-bg" />
          ))}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────── */}
      {!loading && generations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-5"
            style={{
              background: 'linear-gradient(135deg,rgba(212,175,55,0.12),rgba(212,175,55,0.04))',
              border: '1px solid rgba(212,175,55,0.2)',
              boxShadow: '0 0 24px rgba(212,175,55,0.1)',
            }}>
            <ImageIcon className="w-9 h-9 text-gold/50" />
          </div>
          <h3 className="text-[18px] font-black text-white mb-2 tracking-tight">Нет фотосессий</h3>
          <p className="text-white/35 text-[13px] max-w-[200px] leading-relaxed mb-6">
            Создай свою первую AI фотосессию прямо сейчас
          </p>
          <button
            onClick={() => { haptic.heavy(); setSelectedStyle(STYLES[0]); openUpload() }}
            className="flex items-center gap-2 px-6 py-3.5 rounded-[14px] font-black text-[14px] text-black active:scale-95 transition-transform"
            style={{
              background: 'linear-gradient(135deg,#D4AF37 0%,#F5D85A 50%,#B8960C 100%)',
              boxShadow: '0 0 24px rgba(212,175,55,0.5), 0 4px 12px rgba(0,0,0,0.3)',
            }}>
            <Sparkles className="w-4 h-4" />
            Создать фото
          </button>
        </div>
      )}

      {/* ── Generation list ──────────────────────────── */}
      {!loading && generations.length > 0 && (
        <div className="px-4 space-y-3">
          {generations.map((gen) => {
            const tier   = tierMeta(gen.tier)
            const status = statusMeta(gen.status)
            return (
              <button
                key={gen.id}
                onClick={() => { haptic.light(); setSelected(gen) }}
                className="w-full text-left rounded-[18px] overflow-hidden active:scale-[0.97] transition-transform"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
              >
                <div className="flex gap-3 p-3">
                  {/* Thumbnail */}
                  <div className="w-[72px] h-[88px] rounded-[12px] flex-shrink-0 overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {gen.images.length > 0 ? (
                      <img src={gen.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-7 h-7 text-white/15" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <p className="font-black text-white text-[14px] tracking-tight truncate mb-2">
                      {gen.style_name}
                    </p>

                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {/* Tier badge */}
                      <span className="text-[9px] font-black uppercase tracking-[0.1em] px-2 py-[3px] rounded-full"
                        style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.border}` }}>
                        {tier.label}
                      </span>
                      {/* Cost */}
                      <span className="text-[11px] font-bold text-white/40 flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-400 fill-orange-400" />{gen.cost}</span>
                      {/* Multi-photo */}
                      {gen.images.length > 1 && (
                        <span className="text-[11px] text-white/30">· {gen.images.length} фото</span>
                      )}
                    </div>

                    {/* Status pill */}
                    <div className="flex items-center gap-1.5 w-fit px-2 py-[3px] rounded-full"
                      style={{ background: status.bg }}>
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
                      <span className="text-[10px] font-bold" style={{ color: status.color }}>{status.label}</span>
                    </div>

                    <p className="text-white/25 text-[10px] mt-2">
                      {new Date(gen.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Detail sheet ─────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-end"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}>
          <div className="w-full animate-slide-up max-h-[92vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(180deg,#14141E 0%,#0E0E18 100%)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '26px 26px 0 0',
            }}>

            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-[3px] rounded-full bg-white/15" />
            </div>

            {/* Sheet header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-4">
              <div>
                <h3 className="font-black text-white text-[17px] tracking-tight">{selected.style_name}</h3>
                <p className="text-white/35 text-[12px] mt-0.5">
                  <span className="flex items-center gap-1">{tierMeta(selected.tier).label} · <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />{selected.cost}</span>
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Photo grid */}
            <div className="px-4 pb-4">
              <div className={`grid gap-2 mb-5 ${selected.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {selected.images.map((img, i) => (
                  <img key={i} src={img} alt={`Photo ${i + 1}`}
                    className={`w-full object-cover rounded-[14px] ${selected.images.length === 1 ? 'h-72' : 'h-52'}`} />
                ))}
              </div>

              {/* Primary actions */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => selected.images[0] && handleSave(selected.images[0])}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-[14px] font-black text-[13px] text-black active:scale-95 transition-transform relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg,#D4AF37 0%,#F5D85A 50%,#B8960C 100%)',
                    boxShadow: '0 0 20px rgba(212,175,55,0.4)',
                  }}>
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.2) 0%,transparent 60%)' }} />
                  <Download className="w-4 h-4" />
                  Сохранить
                </button>
                <button
                  onClick={() => selected.images[0] && handleShare(selected.images[0])}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-[14px] font-bold text-[13px] active:scale-95 transition-transform"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(212,175,55,0.4)',
                    color: 'rgba(212,175,55,1)',
                  }}>
                  <Share2 className="w-4 h-4" />
                  Поделиться
                </button>
              </div>

              {/* Secondary actions */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => { setSelected(null); const s = STYLES.find(st => st.id === selected.style_id) ?? STYLES[0]; setSelectedStyle(s); openUpload() }}
                  className="flex items-center justify-center gap-2 py-3 rounded-[14px] font-semibold text-[12px] text-white/70 active:scale-95 transition-transform"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Ещё раз
                </button>
                <button
                  onClick={() => { setSelected(null); openPaywall('subscription') }}
                  className="flex items-center justify-center gap-2 py-3 rounded-[14px] font-semibold text-[12px] active:scale-95 transition-transform"
                  style={{
                    background: 'rgba(212,175,55,0.08)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    color: 'rgba(212,175,55,1)',
                  }}>
                  <Crown className="w-3.5 h-3.5" />
                  PRO стили
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
