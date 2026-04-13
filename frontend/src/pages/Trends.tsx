import { useState } from 'react'
import { Sparkles, Flame, Crown, Star, Search } from 'lucide-react'
import { StyleCard } from '../components/ui/StyleCard'
import { STYLES } from '../data/styles'
import { useTelegram } from '../hooks/useTelegram'

type TrendTab = 'all' | 'hot' | 'premium' | 'new'

const TABS = [
  { id: 'all'     as TrendTab, Icon: Sparkles, label: 'Все',      glow: 'rgba(255,255,255,0.08)',  border: 'rgba(255,255,255,0.12)' },
  { id: 'hot'     as TrendTab, Icon: Flame,    label: 'Горячие',  glow: 'rgba(249,115,22,0.25)',   border: 'rgba(249,115,22,0.3)' },
  { id: 'premium' as TrendTab, Icon: Crown,    label: 'Премиум',  glow: 'rgba(212,175,55,0.25)',   border: 'rgba(212,175,55,0.35)' },
  { id: 'new'     as TrendTab, Icon: Star,     label: 'Новинки',  glow: 'rgba(168,85,247,0.2)',    border: 'rgba(168,85,247,0.3)' },
]

const BANNERS = {
  all:     null,
  hot:     { Icon: Flame,  iconColor: 'rgba(249,115,22,1)', title: 'Горячие тренды',      sub: 'Самые востребованные стили этой недели',       orb1: 'rgba(249,115,22,0.2)', orb2: 'rgba(239,68,68,0.15)',  border: 'rgba(249,115,22,0.35)' },
  premium: { Icon: Crown,  iconColor: 'rgba(212,175,55,1)', title: 'Премиум коллекция',   sub: 'Эксклюзивные стили только для PRO',           orb1: 'rgba(212,175,55,0.2)', orb2: 'rgba(180,140,20,0.12)', border: 'rgba(212,175,55,0.4)' },
  new:     { Icon: Star,   iconColor: 'rgba(168,85,247,1)', title: 'Новинки',              sub: 'Популярные новые стили сезона',               orb1: 'rgba(168,85,247,0.2)', orb2: 'rgba(99,102,241,0.15)', border: 'rgba(168,85,247,0.35)' },
}

export function Trends() {
  const [tab, setTab] = useState<TrendTab>('all')
  const { haptic } = useTelegram()

  const filtered = STYLES.filter((s) => {
    if (tab === 'hot')     return s.trending
    if (tab === 'premium') return s.category === 'premium'
    if (tab === 'new')     return s.new
    return true
  })

  const banner = BANNERS[tab]

  return (
    <div className="flex flex-col min-h-screen bg-app-bg pb-28">

      {/* ── Header ───────────────────────────────────── */}
      <div className="relative px-4 pt-6 pb-4 overflow-hidden">
        <div className="absolute -top-8 right-0 w-52 h-32 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.1) 0%, transparent 70%)' }} />
        <div className="relative flex items-end justify-between">
          <div>
            <h1 className="text-[22px] font-black text-white tracking-tight">Тренды</h1>
            <p className="text-white/35 text-[12px] mt-0.5">Самые популярные стили прямо сейчас</p>
          </div>
          <div className="pb-0.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-white/40 text-[12px] font-bold tabular-nums">{filtered.length}</span>
          </div>
        </div>
      </div>

      {/* ── Filter tabs ──────────────────────────────── */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map(({ id, Icon, label, glow, border }) => {
            const isActive = tab === id
            return (
              <button
                key={id}
                onClick={() => { haptic.selection(); setTab(id) }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold whitespace-nowrap flex-shrink-0 transition-all duration-200 active:scale-95"
                style={isActive ? {
                  background: 'rgba(255,255,255,0.08)',
                  border: `1px solid ${border}`,
                  boxShadow: `0 0 14px ${glow}`,
                  color: '#fff',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.35)',
                }}
              >
                <Icon className="w-3.5 h-3.5"
                  style={isActive ? { filter: `drop-shadow(0 0 5px ${glow})` } : undefined} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Contextual banner ────────────────────────── */}
      {banner && (
        <div className="mx-4 mb-5 relative overflow-hidden p-4 rounded-[18px]"
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${banner.border}` }}>
          <div className="absolute -top-6 -right-6 w-32 h-32 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${banner.orb1} 0%, transparent 70%)` }} />
          <div className="absolute -bottom-8 -left-6 w-28 h-28 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${banner.orb2} 0%, transparent 70%)` }} />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
              style={{ background: `${banner.orb1.replace('0.2)', '0.15)')}`, border: `1px solid ${banner.border}` }}>
              <banner.Icon className="w-5 h-5" style={{ color: banner.iconColor, filter: `drop-shadow(0 0 6px ${banner.orb1})` }} />
            </div>
            <div>
              <p className="font-black text-white text-[15px] tracking-tight">{banner.title}</p>
              <p className="text-white/40 text-[12px] mt-0.5">{banner.sub}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Grid ─────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 px-4">
          {filtered.map((style, idx) => (
            <div
              key={style.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <StyleCard style={style} size="lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center px-8">
          <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-4"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Search className="w-7 h-7 text-white/25" />
          </div>
          <p className="text-white/40 text-[14px] font-semibold">Нет стилей</p>
          <p className="text-white/20 text-[12px] mt-1">В этой категории пока ничего нет</p>
        </div>
      )}
    </div>
  )
}
