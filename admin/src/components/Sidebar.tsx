import React from 'react'
import { LayoutDashboard, Palette, Users, ImageIcon, LogOut } from 'lucide-react'
import type { Page } from '../App'

interface Props {
  current: Page
  onChange: (p: Page) => void
  onLogout: () => void
}

const ITEMS: { id: Page; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'dashboard',   label: 'Dashboard',    Icon: LayoutDashboard },
  { id: 'styles',      label: 'Стили',        Icon: Palette },
  { id: 'users',       label: 'Пользователи', Icon: Users },
  { id: 'generations', label: 'Генерации',    Icon: ImageIcon },
]

export default function Sidebar({ current, onChange, onLogout }: Props) {
  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-[#161b27] border-r border-white/[0.07] min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.07]">
        <span className="text-lg font-black tracking-tight" style={{
          background: 'linear-gradient(135deg,#D4AF37,#F5D85A)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          LENSY Admin
        </span>
        <p className="text-xs text-white/30 mt-0.5">Панель управления</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              current === id
                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/[0.07]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </button>
      </div>
    </aside>
  )
}
