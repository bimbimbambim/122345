import React from 'react'
import { Crown, Lock, Flame, Zap, Sparkles, X, ChevronRight } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useTelegram } from '../../hooks/useTelegram'

type TierKey = 'fast' | 'standard' | 'premium'

interface TierMeta {
  icon: React.ReactNode
  label: string
  desc: string
  color: string
  glow: string
  glowDim: string
  border: string
}

const CATEGORY_LABELS: Record<string, string> = {
  standard: 'Стандарт',
  premium:  'Премиум',
}

export function StyleDetailSheet() {
  const TIER_INFO: Record<TierKey, TierMeta> = {
    fast:     { icon: <Zap className="w-4 h-4" />,      label: 'FAST',     desc: '~30 сек',    color: 'rgba(96,165,250,1)',  glow: 'rgba(59,130,246,0.25)',  glowDim: 'rgba(59,130,246,0.1)',   border: 'rgba(59,130,246,0.35)' },
    standard: { icon: <Sparkles className="w-4 h-4" />, label: 'СТАНДАРТ', desc: '~60 сек',    color: 'rgba(212,175,55,1)',  glow: 'rgba(212,175,55,0.2)',   glowDim: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.35)' },
    premium:  { icon: <Crown className="w-4 h-4" />,    label: 'ПРЕМИУМ',  desc: 'HD качество', color: 'rgba(168,85,247,1)', glow: 'rgba(168,85,247,0.25)', glowDim: 'rgba(168,85,247,0.1)',  border: 'rgba(168,85,247,0.35)' },
  }
  const {
    showStyleDetail, closeStyleDetail,
    selectedStyle, selectedTier, setSelectedTier,
    openUpload, openPaywall, user,
  } = useStore()
  const { haptic } = useTelegram()

  if (!showStyleDetail || !selectedStyle) return null

  const isPremium = selectedStyle.category === 'premium'
  const isLocked  = isPremium && !user?.subscription

  const tierCost = selectedTier === 'fast'
    ? selectedStyle.price_fast
    : selectedTier === 'premium'
    ? selectedStyle.price_premium
    : selectedStyle.price_standard

  const handleCreate = () => {
    haptic.heavy()
    closeStyleDetail()
    if (isLocked) { openPaywall('subscription'); return }
    openUpload()
  }

  const handleClose = () => {
    haptic.light()
    closeStyleDetail()
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75"
        style={{ backdropFilter: 'blur(10px)' }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full animate-slide-up overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #14141E 0%, #0E0E18 100%)',
          borderTop: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '26px 26px 0 0',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* Hero image */}
        <div className="relative w-full" style={{ height: '52vw', maxHeight: 240, minHeight: 180 }}>
          <img
            src={selectedStyle.image}
            alt={selectedStyle.name}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(20,20,30,0.85) 100%)' }} />

          {/* Locked dim */}
          {isLocked && (
            <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(212,175,55,0.4)' }}>
                  <Lock className="w-5 h-5 text-gold" />
                </div>
                <span className="text-white/80 text-[12px] font-bold">Нужна подписка</span>
              </div>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <X className="w-4 h-4 text-white/80" />
          </button>

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            {isPremium ? (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{ background: 'linear-gradient(135deg,#D4AF37,#F5D85A)', boxShadow: '0 0 10px rgba(212,175,55,0.5)' }}>
                <Crown className="w-3 h-3 text-black" />
                <span className="text-[10px] font-black text-black uppercase tracking-wide">PREMIUM</span>
              </div>
            ) : (
              <span className="text-[10px] font-black text-white/70 px-2.5 py-1 rounded-full uppercase tracking-wide"
                style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)' }}>
                {CATEGORY_LABELS[selectedStyle.category]}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-4 pb-10 space-y-4">

          {/* Title + tags */}
          <div>
            <h2 className="text-[22px] font-black text-white tracking-tight mb-2">
              {selectedStyle.name}
            </h2>
            {selectedStyle.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedStyle.tags.map((tag) => (
                  <span key={tag}
                    className="text-[11px] font-semibold text-white/40 px-2.5 py-1 rounded-full capitalize"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Prompt preview */}
          <div className="p-3.5 rounded-[14px]"
            style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="text-[10px] font-bold text-gold/60 uppercase tracking-widest mb-1.5">Пример промпта</p>
            <p className="text-white/55 text-[12px] leading-relaxed italic">«{selectedStyle.prompt}»</p>
          </div>

          {/* Tier selector (only if not locked) */}
          {!isLocked ? (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Качество</p>
              <div className="grid grid-cols-3 gap-2">
                {(['fast', 'standard', 'premium'] as const).map((t) => {
                  const info = TIER_INFO[t]
                  const cost = t === 'fast'
                    ? selectedStyle.price_fast
                    : t === 'premium'
                    ? selectedStyle.price_premium
                    : selectedStyle.price_standard
                  const isActive = selectedTier === t
                  return (
                    <button
                      key={t}
                      onClick={() => { haptic.selection(); setSelectedTier(t) }}
                      className="py-3 rounded-[14px] text-center transition-all duration-150 active:scale-95"
                      style={isActive ? {
                        background: info.glowDim,
                        border: `1px solid ${info.border}`,
                        boxShadow: `0 0 14px ${info.glow}`,
                      } : {
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}>
                      <div className="flex justify-center mb-1"
                        style={{ color: isActive ? info.color : 'rgba(255,255,255,0.25)' }}>
                        {info.icon}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-wide"
                        style={{ color: isActive ? info.color : 'rgba(255,255,255,0.35)' }}>
                        {info.label}
                      </p>
                      <p className="text-[10px] text-white/25 mt-0.5">{info.desc}</p>
                      <p className="text-[12px] font-black mt-1 flex items-center justify-center gap-0.5"
                        style={{ color: isActive ? info.color : 'rgba(255,255,255,0.5)' }}>
                        <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />{cost}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Locked state CTA */
            <div className="p-4 rounded-[16px] text-center"
              style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <Crown className="w-6 h-6 text-gold mx-auto mb-2" />
              <p className="font-bold text-white text-[14px] mb-1">Премиум стиль</p>
              <p className="text-white/40 text-[12px]">Доступен с подпиской PRO или MAX</p>
            </div>
          )}

          {/* CTA button */}
          <button
            onClick={handleCreate}
            className="w-full py-4 rounded-[16px] font-black text-[15px] tracking-tight active:scale-[0.97] transition-all duration-150 flex items-center justify-center gap-2 relative overflow-hidden"
            style={isLocked ? {
              background: 'linear-gradient(135deg,#D4AF37 0%,#F5D85A 50%,#B8960C 100%)',
              boxShadow: '0 0 24px rgba(212,175,55,0.5), 0 4px 16px rgba(0,0,0,0.3)',
              color: '#000',
            } : {
              background: 'linear-gradient(135deg,#D4AF37 0%,#F5D85A 50%,#B8960C 100%)',
              boxShadow: '0 0 24px rgba(212,175,55,0.5), 0 4px 16px rgba(0,0,0,0.3)',
              color: '#000',
            }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.18) 0%,transparent 60%)' }} />
            {isLocked ? (
              <>
                <Crown className="w-5 h-5 relative" />
                <span className="relative">Оформить подписку</span>
                <ChevronRight className="w-4 h-4 relative opacity-70" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 relative" />
                <span className="relative">Создать в этом стиле</span>
                <span className="relative text-black/50 text-[13px] flex items-center gap-0.5">
                  <Flame className="w-3 h-3" />{tierCost}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
