import { Crown, Lock, Flame, Zap } from 'lucide-react'
import type { Style } from '../../types'
import { useStore } from '../../store/useStore'
import { useTelegram } from '../../hooks/useTelegram'

interface StyleCardProps {
  style: Style
  size?: 'sm' | 'md' | 'lg'
}

export function StyleCard({ style, size = 'md' }: StyleCardProps) {
  const { setSelectedStyle, openStyleDetail, user } = useStore()
  const { haptic } = useTelegram()

  const sizeClasses = {
    sm: 'h-[176px] w-[136px]',
    md: 'h-[220px] w-[164px]',
    lg: 'h-[300px] w-full',
  }

  const isPremium = style.category === 'premium'
  const isLocked  = isPremium && !user?.subscription

  const handleTap = () => {
    haptic.medium()
    if (!user) return
    setSelectedStyle(style)
    openStyleDetail()
  }

  return (
    <button
      onClick={handleTap}
      className={`relative ${sizeClasses[size]} rounded-[18px] overflow-hidden flex-shrink-0 transition-all duration-150 active:scale-[0.93]`}
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.45)' }}
    >
      {/* Image */}
      <img
        src={style.image}
        alt={style.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* Gradient overlay — deep cinematic */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.88) 100%)' }} />

      {/* Locked premium dim */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
      )}

      {/* Top-left badge: HOT */}
      {style.trending && !isPremium && (
        <div className="absolute top-2.5 left-2.5">
          <span className="flex items-center gap-0.5 text-[9px] font-black uppercase tracking-[0.1em] px-2 py-[3px] rounded-full text-white"
            style={{ background: 'linear-gradient(135deg,#FF4757,#FF6B81)', boxShadow: '0 0 10px rgba(255,71,87,0.6)' }}>
            <Zap className="w-2.5 h-2.5 fill-white" /> HOT
          </span>
        </div>
      )}

      {/* Top-right badge: PREMIUM or LOCK */}
      {isPremium && (
        <div className="absolute top-2.5 right-2.5">
          {isLocked ? (
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(212,175,55,0.4)', backdropFilter: 'blur(8px)' }}>
              <Lock className="w-3.5 h-3.5 text-gold" />
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-[3px] rounded-full"
              style={{ background: 'linear-gradient(135deg,#D4AF37,#F5D85A,#B8960C)', boxShadow: '0 0 8px rgba(212,175,55,0.5)' }}>
              <Crown className="w-2.5 h-2.5 text-black" />
              <span className="text-[9px] font-black text-black uppercase tracking-[0.08em]">
                {style.badge || 'VIP'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
        <p className="text-white font-bold text-[13px] leading-tight tracking-[-0.01em] mb-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
          {style.name}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3 h-3 text-orange-400 fill-orange-400 flex-shrink-0" />
            <span className="text-[12px] font-bold text-gold/90 tabular-nums">
              {isLocked ? '—' : style.price_standard}
            </span>
          </div>
          {isLocked && (
            <span className="text-[10px] font-bold text-gold/70 tracking-wide">PRO</span>
          )}
        </div>
      </div>

      {/* Subtle border shine */}
      <div className="absolute inset-0 rounded-[18px] pointer-events-none"
        style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.3)' }} />
    </button>
  )
}
