import React from 'react'
import { Home, TrendingUp, ImageIcon, User, Sparkles } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useTelegram } from '../../hooks/useTelegram'
import { STYLES } from '../../data/styles'

const LEFT_TABS = [
  { id: 'home' as const, label: 'Главная', Icon: Home },
  { id: 'trends' as const, label: 'Тренды', Icon: TrendingUp },
]
const RIGHT_TABS = [
  { id: 'sessions' as const, label: 'Сессии', Icon: ImageIcon },
  { id: 'profile' as const, label: 'Профиль', Icon: User },
]

export function BottomNav() {
  const { activeTab, setActiveTab, setSelectedStyle, openUpload } = useStore()
  const { haptic } = useTelegram()

  const handleTab = (id: typeof activeTab) => {
    if (id !== activeTab) {
      haptic.selection()
      setActiveTab(id)
    }
  }

  const handleCreate = () => {
    haptic.heavy()
    setSelectedStyle(STYLES[0])
    openUpload()
  }

  const NavBtn = ({ id, label, Icon }: { id: typeof activeTab; label: string; Icon: React.ElementType }) => {
    const isActive = activeTab === id
    return (
      <button
        onClick={() => handleTab(id)}
        className="flex flex-col items-center gap-[3px] flex-1 py-2 active:scale-90 transition-transform duration-150"
      >
        <div className={`relative p-1.5 rounded-[10px] transition-all duration-200 ${isActive ? 'bg-gold/10' : ''}`}>
          <Icon
            className={`w-[22px] h-[22px] transition-all duration-200 ${
              isActive
                ? 'text-gold'
                : 'text-white/35'
            }`}
            style={isActive ? { filter: 'drop-shadow(0 0 5px rgba(212,175,55,0.7))' } : undefined}
          />
          {isActive && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />
          )}
        </div>
        <span className={`text-[10px] font-semibold transition-all duration-200 ${isActive ? 'text-gold/90' : 'text-white/25'}`}>
          {label}
        </span>
      </button>
    )
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Fade-up blur mask */}
      <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(11,11,15,0.98) 0%, rgba(11,11,15,0.7) 60%, transparent 100%)' }} />

      <div className="relative flex items-end justify-around px-3 pb-2 pt-1">

        {/* Left tabs */}
        {LEFT_TABS.map(t => <NavBtn key={t.id} {...t} />)}

        {/* Center create button */}
        <div className="flex flex-col items-center gap-[3px] -mt-5 mx-1">
          <button
            onClick={handleCreate}
            className="w-[58px] h-[58px] rounded-[18px] flex items-center justify-center active:scale-90 transition-transform duration-150 relative"
            style={{
              background: 'linear-gradient(145deg,#D4AF37 0%,#F5D85A 45%,#A07820 100%)',
              boxShadow: '0 0 24px rgba(212,175,55,0.6), 0 0 48px rgba(212,175,55,0.2), 0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            {/* Shine */}
            <div className="absolute inset-0 rounded-[18px] pointer-events-none"
              style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.25) 0%, transparent 55%)' }} />
            <Sparkles className="w-[26px] h-[26px] text-black/80" strokeWidth={2} />
          </button>
          <span className="text-[10px] font-bold text-gold/80">Создать</span>
        </div>

        {/* Right tabs */}
        {RIGHT_TABS.map(t => <NavBtn key={t.id} {...t} />)}
      </div>
    </div>
  )
}
