import { Plus, Flame, Sparkles } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useTelegram } from '../../hooks/useTelegram'

export function TopBar() {
  const { user, openPaywall } = useStore()
  const { haptic } = useTelegram()

  const handleBuy = () => {
    haptic.medium()
    openPaywall('coins')
  }

  return (
    <div className="flex items-center justify-between px-4 pt-5 pb-3">

      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-8 h-8 rounded-xl overflow-hidden flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#1a1a2e 0%,#0d0d1a 100%)', border: '1px solid rgba(212,175,55,0.3)' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-gold" style={{ filter: 'drop-shadow(0 0 4px rgba(212,175,55,0.8))' }} />
          </div>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[17px] font-black tracking-[-0.04em] text-gradient-gold">LENSY</span>
          <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.18em] mt-0.5">AI Studio</span>
        </div>
      </div>

      {/* Right — balance + buy */}
      <div className="flex items-center gap-2">
        {/* Balance pill */}
        <div className="flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{
            background: 'rgba(19,19,26,0.95)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}>
          <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 flex-shrink-0" />
          <span className="text-[13px] font-bold text-white tabular-nums">
            {user?.fire_coins ?? 0}
          </span>
        </div>

        {/* Buy button */}
        <button
          onClick={handleBuy}
          className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 active:scale-95 transition-transform"
          style={{
            background: 'linear-gradient(135deg,#D4AF37 0%,#F5D85A 50%,#B8960C 100%)',
            boxShadow: '0 0 16px rgba(212,175,55,0.45), 0 2px 8px rgba(0,0,0,0.3)',
          }}>
          <Plus className="w-3.5 h-3.5 text-black" strokeWidth={3} />
          <span className="text-[13px] font-black text-black tracking-tight">Купить</span>
        </button>
      </div>
    </div>
  )
}
