import React, { useState } from 'react'
import { Crown, ChevronRight, Zap, Star, Camera, Flame, TrendingUp, Video, Wrench } from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { StyleCard } from '../components/ui/StyleCard'
import { STYLES } from '../data/styles'
import { useStore } from '../store/useStore'
import { useTelegram } from '../hooks/useTelegram'

type ContentTab = 'photo' | 'video' | 'tools'

const QUICK_ACTIONS = [
  {
    Icon: Camera,
    label: 'Моё фото',
    sub: 'Загрузить',
    action: 'create',
    color: 'rgba(212,175,55,1)',
    glow: 'rgba(212,175,55,0.35)',
    border: 'rgba(212,175,55,0.25)',
  },
  {
    Icon: Crown,
    label: 'Премиум',
    sub: 'VIP стили',
    action: 'premium',
    color: 'rgba(168,85,247,1)',
    glow: 'rgba(168,85,247,0.3)',
    border: 'rgba(168,85,247,0.2)',
  },
  {
    Icon: Flame,
    label: 'Тренды',
    sub: 'Хиты недели',
    action: 'trending',
    color: 'rgba(249,115,22,1)',
    glow: 'rgba(249,115,22,0.3)',
    border: 'rgba(249,115,22,0.2)',
  },
  {
    Icon: Zap,
    label: 'Быстро',
    sub: 'за 30 сек',
    action: 'fast',
    color: 'rgba(96,165,250,1)',
    glow: 'rgba(59,130,246,0.3)',
    border: 'rgba(59,130,246,0.2)',
  },
]

export function Home() {
  const [contentTab, setContentTab] = useState<ContentTab>('photo')
  const { setSelectedStyle, openUpload, openPaywall, user } = useStore()
  const { haptic } = useTelegram()

  const popularStyles  = STYLES.filter((s) => s.popular)
  const trendingStyles = STYLES.filter((s) => s.trending)
  const premiumStyles  = STYLES.filter((s) => s.category === 'premium')

  const handleQuickAction = (action: string) => {
    haptic.medium()
    if (action === 'create' || action === 'fast') {
      if (!user) return
      setSelectedStyle(STYLES[0])
      openUpload()
    } else if (action === 'premium') {
      user?.subscription ? (setSelectedStyle(premiumStyles[0]), openUpload()) : openPaywall('subscription')
    } else if (action === 'trending') {
      setSelectedStyle(trendingStyles[0] ?? STYLES[0])
      openUpload()
    }
  }

  return (
    <div className="flex flex-col bg-app-bg pb-28 min-h-screen">
      <TopBar />

      {/* ── Category tabs ──────────────────────────────── */}
      <div className="px-4 mt-1 mb-1">
        <div className="flex gap-1 p-1 rounded-[14px]"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {([
            { id: 'photo' as const, Icon: Camera, label: 'Фото', soon: false },
            { id: 'video' as const, Icon: Video,  label: 'Видео', soon: true },
            { id: 'tools' as const, Icon: Wrench, label: 'Инструменты', soon: true },
          ]).map(({ id, Icon, label, soon }) => (
            <button
              key={id}
              onClick={() => { haptic.selection(); setContentTab(id) }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-[9px] rounded-[10px] text-[12px] font-bold tracking-tight transition-all duration-200 ${
                contentTab === id ? 'text-black' : 'text-white/40'
              }`}
              style={contentTab === id ? {
                background: 'linear-gradient(135deg,#D4AF37 0%,#F5D85A 50%,#B8960C 100%)',
                boxShadow: '0 2px 10px rgba(212,175,55,0.4)',
              } : undefined}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {soon && contentTab !== id && (
                <span className="text-[9px] opacity-40">soon</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── HERO ───────────────────────────────────────── */}
      <div className="mx-4 mt-3 rounded-[22px] overflow-hidden relative"
        style={{ minHeight: 168 }}>
        {/* Deep background */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #0d0d1f 0%, #12121e 40%, #0a0a14 100%)' }} />
        {/* Ambient orbs */}
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-12 -left-8 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(120,80,200,0.14) 0%, transparent 70%)' }} />
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E\")", backgroundSize: '200px 200px' }} />
        {/* Border */}
        <div className="absolute inset-0 rounded-[22px] pointer-events-none"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 0 0 1px rgba(212,175,55,0.12)' }} />

        <div className="relative px-5 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-[1px] w-6"
                style={{ background: 'linear-gradient(90deg,rgba(212,175,55,0.8),transparent)' }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold/60">
                AI Фото Студия
              </span>
            </div>
            <h1 className="text-[32px] font-black leading-[1.1] tracking-[-0.04em] mb-2">
              <span className="text-white">3 000+</span>{' '}
              <span className="text-gradient-gold">образов</span>
            </h1>
            <p className="text-white/45 text-[13px] font-medium leading-snug mb-4">
              Профессиональная фотосессия<br />прямо из Telegram
            </p>

            {!user?.subscription ? (
              <button
                onClick={() => { haptic.medium(); openPaywall('subscription') }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] active:scale-95 transition-transform"
                style={{
                  background: 'linear-gradient(135deg,#D4AF37 0%,#F5D85A 50%,#B8960C 100%)',
                  boxShadow: '0 0 20px rgba(212,175,55,0.45), 0 4px 12px rgba(0,0,0,0.4)',
                }}>
                <Crown className="w-3.5 h-3.5 text-black" />
                <span className="text-[13px] font-black text-black tracking-tight">Получить PRO</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-[12px] font-bold">PRO активен</span>
              </div>
            )}
          </div>

          {/* Right stats */}
          <div className="flex flex-col gap-2.5 items-end flex-shrink-0 ml-3">
            {[
              { value: '30с', label: 'генерация' },
              { value: '4K', label: 'качество' },
              { value: '∞', label: 'стилей' },
            ].map(({ value, label }) => (
              <div key={label} className="text-right">
                <div className="text-[18px] font-black text-gradient-gold leading-none">{value}</div>
                <div className="text-[9px] text-white/30 uppercase tracking-[0.12em] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick actions ──────────────────────────────── */}
      <div className="px-4 mt-5">
        <div className="grid grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.map(({ Icon, label, sub, action, color, glow, border }) => (
            <button
              key={action}
              onClick={() => handleQuickAction(action)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-[16px] active:scale-90 transition-transform duration-150"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${border}`,
                boxShadow: `0 0 16px ${glow}`,
              }}
            >
              <div className="w-7 h-7 flex items-center justify-center">
                <Icon className="w-[22px] h-[22px]" style={{ color, filter: `drop-shadow(0 0 5px ${glow})` }} />
              </div>
              <div className="text-center">
                <div className="text-white text-[11px] font-bold leading-tight">{label}</div>
                <div className="text-white/35 text-[9px] leading-tight mt-0.5">{sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Free gen banner ────────────────────────────── */}
      {!user?.free_used && (
        <div className="mx-4 mt-4">
          <button
            onClick={() => { haptic.heavy(); setSelectedStyle(STYLES[0]); openUpload() }}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-[16px] active:scale-[0.97] transition-transform"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.05) 100%)',
              border: '1px solid rgba(212,175,55,0.3)',
              boxShadow: '0 0 24px rgba(212,175,55,0.1)',
            }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
                <Zap className="w-4 h-4 text-gold" />
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-[13px] leading-tight">Бесплатная генерация</div>
                <div className="text-white/40 text-[11px] mt-0.5">Попробуй сейчас — это бесплатно</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <Star className="w-3 h-3 text-gold" />
              <span className="text-gold text-[11px] font-bold">FREE</span>
            </div>
          </button>
        </div>
      )}

      {contentTab === 'photo' && (
        <>
          <FeedSection
            title="Для вас"
            Icon={Star}
            iconColor="rgba(212,175,55,1)"
            styles={STYLES.slice(0, 6)}
            onSeeAll={() => {}}
          />
          <FeedSection
            title="Популярное"
            Icon={Flame}
            iconColor="rgba(249,115,22,1)"
            styles={popularStyles}
            onSeeAll={() => {}}
          />
          <FeedSection
            title="Премиум"
            Icon={Crown}
            iconColor="rgba(212,175,55,1)"
            styles={premiumStyles}
            badge
            onSeeAll={() => { haptic.medium(); openPaywall('subscription') }}
          />
          <FeedSection
            title="Тренды"
            Icon={TrendingUp}
            iconColor="rgba(59,130,246,1)"
            styles={trendingStyles}
            onSeeAll={() => {}}
          />
        </>
      )}

      {contentTab !== 'photo' && (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {contentTab === 'video'
              ? <Video className="w-7 h-7 text-white/25" />
              : <Wrench className="w-7 h-7 text-white/25" />
            }
          </div>
          <h3 className="text-[18px] font-black text-white mb-2 tracking-tight">
            {contentTab === 'video' ? 'Видео — скоро' : 'Инструменты'}
          </h3>
          <p className="text-white/35 text-[13px] max-w-[220px] leading-relaxed">
            {contentTab === 'video'
              ? 'AI видеогенерация появится в следующем обновлении'
              : 'Дополнительные AI-инструменты уже в разработке'}
          </p>
        </div>
      )}
    </div>
  )
}

function FeedSection({
  title,
  Icon,
  iconColor,
  styles,
  badge,
  onSeeAll,
}: {
  title: string
  Icon: React.ElementType
  iconColor: string
  styles: typeof STYLES
  badge?: boolean
  onSeeAll: () => void
}) {
  const { haptic } = useTelegram()
  if (!styles.length) return null

  return (
    <div className="mt-7">
      <div className="flex items-center justify-between px-4 mb-3.5">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: iconColor, filter: `drop-shadow(0 0 4px ${iconColor}80)` }} />
          <h2 className="text-[16px] font-black text-white tracking-tight">{title}</h2>
          {badge && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}>
              <Star className="w-2.5 h-2.5 text-gold" />
              <span className="text-[9px] font-bold text-gold uppercase tracking-wide">VIP</span>
            </div>
          )}
        </div>
        <button
          onClick={() => { haptic.light(); onSeeAll() }}
          className="flex items-center gap-0.5 active:scale-95 transition-transform"
        >
          <span className="text-[12px] font-bold text-white/30">Все</span>
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
        </button>
      </div>

      <div className="relative">
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none"
          style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {styles.map((style) => (
            <StyleCard key={style.id} style={style} />
          ))}
          <div className="flex-shrink-0 w-4" />
        </div>
        <div className="absolute right-0 top-0 bottom-1 w-12 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #0B0B0F 0%, transparent 100%)' }} />
      </div>
    </div>
  )
}
