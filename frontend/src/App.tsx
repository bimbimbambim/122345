import { useEffect } from 'react'
import { BottomNav } from './components/layout/BottomNav'
import { PaywallModal } from './components/ui/PaywallModal'
import { UploadModal } from './components/ui/UploadModal'
import { GeneratingModal } from './components/ui/GeneratingModal'
import { StyleDetailSheet } from './components/ui/StyleDetailSheet'
import { Home } from './pages/Home'
import { Trends } from './pages/Trends'
import { Sessions } from './pages/Sessions'
import { Profile } from './pages/Profile'
import { useStore } from './store/useStore'
import { useTelegram } from './hooks/useTelegram'
import { apiRoutes } from './api/client'
import type { User } from './types'

export default function App() {
  const { activeTab, setUser } = useStore()
  const { tg, isInTelegram } = useTelegram()

  useEffect(() => {
    if (tg) {
      try { (tg as unknown as Record<string, (c: string) => void>).setHeaderColor?.('#0B0B0F') } catch {}
      try { (tg as unknown as Record<string, (c: string) => void>).setBackgroundColor?.('#0B0B0F') } catch {}
    }
    const init = async () => {
      try {
        const res = await apiRoutes.auth.init()
        setUser(res.data)
      } catch (err) {
        if (!isInTelegram) {
          setUser({
            id: 1,
            telegram_id: '123456789',
            username: 'demo_user',
            first_name: 'Demo',
            fire_coins: 50,
            free_used: false,
            subscription: null,
            referral_code: 'DEMO123',
            referrals_count: 0,
            total_generations: 0,
            created_at: new Date().toISOString(),
          })
        }
      }
    }
    init()
  }, [tg, isInTelegram, setUser])

  const pages = {
    home: <Home />,
    trends: <Trends />,
    sessions: <Sessions />,
    profile: <Profile />,
  }

  return (
    <div className="min-h-screen bg-app-bg overflow-x-hidden">
      <div className="relative">
        {pages[activeTab]}
      </div>

      <BottomNav />
      <StyleDetailSheet />
      <PaywallModal />
      <UploadModal />
      <GeneratingModal />
    </div>
  )
}
