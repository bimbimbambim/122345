import { useState } from 'react'
import { X, Crown, Zap, Check, Sparkles, Flame } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useTelegram } from '../../hooks/useTelegram'
import { apiRoutes } from '../../api/client'
import { COIN_PACKS, SUBSCRIPTION_PLANS, DIRECT_PRODUCTS } from '../../data/styles'
import type { PaywallTab } from '../../types'

export function PaywallModal() {
  const { showPaywall, paywallTab, closePaywall, selectedStyle, setUser, user } = useStore()
  const { haptic, tg } = useTelegram()
  const [activeTab, setActiveTab] = useState<PaywallTab>(paywallTab)
  const [loading, setLoading] = useState<string | null>(null)

  if (!showPaywall) return null

  const handleTabChange = (tab: PaywallTab) => {
    haptic.selection()
    setActiveTab(tab)
  }

  const handlePayment = async (productId: string, productType: 'coins' | 'subscription' | 'direct') => {
    haptic.medium()
    setLoading(productId)
    try {
      const res = await apiRoutes.payments.createInvoice({ product_id: productId, product_type: productType })
      const invoiceUrl = res.data.invoice_url
      if (tg && invoiceUrl) {
        tg.openInvoice(invoiceUrl, async (status) => {
          if (status === 'paid') {
            haptic.success()
            try { const u = await apiRoutes.user.me(); setUser(u.data) } catch {}
            closePaywall()
          } else { haptic.error() }
          setLoading(null)
        })
      }
    } catch {
      haptic.error()
      setLoading(null)
    }
  }

  const TABS = [
    { id: 'subscription' as const, Icon: Crown,    label: 'Подписка' },
    { id: 'coins' as const,        Icon: Flame,    label: 'Огоньки' },
    { id: 'generation' as const,   Icon: Zap,      label: 'Разово' },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75"
        style={{ backdropFilter: 'blur(12px)' }}
        onClick={closePaywall}
      />

      {/* Sheet */}
      <div className="relative w-full animate-slide-up"
        style={{
          background: 'linear-gradient(180deg, #14141E 0%, #0E0E18 100%)',
          borderTop: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '26px 26px 0 0',
          maxHeight: '88vh',
          overflowY: 'auto',
        }}>

        {/* Top ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-16 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.22) 0%, transparent 70%)' }} />

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-9 h-[3px] rounded-full bg-white/15" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-10 px-5 pb-4"
          style={{ background: 'linear-gradient(180deg, #14141E 80%, transparent 100%)' }}>
          <div className="flex items-start justify-between mb-5 pt-1">
            <div>
              <h2 className="text-[20px] font-black text-white tracking-tight">
                {activeTab === 'subscription' ? 'Выбери план' :
                 activeTab === 'coins' ? 'Купить огоньки' : 'Разовая покупка'}
              </h2>
              <p className="text-white/35 text-[13px] mt-0.5">
                {activeTab === 'subscription' ? 'Ежемесячно + доступ ко всем стилям' :
                 activeTab === 'coins'
                   ? <span className="flex items-center gap-1">Баланс: {user?.fire_coins ?? 0} <Flame className="w-3 h-3 text-orange-400 fill-orange-400" /></span>
                   : 'Без подписки'}
              </p>
            </div>
            <button
              onClick={closePaywall}
              className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform mt-1"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {TABS.map(({ id, Icon, label }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-[14px] transition-all duration-200 active:scale-95"
                style={activeTab === id ? {
                  background: 'linear-gradient(135deg,rgba(212,175,55,0.2) 0%,rgba(212,175,55,0.08) 100%)',
                  border: '1px solid rgba(212,175,55,0.4)',
                  boxShadow: '0 0 16px rgba(212,175,55,0.15)',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <Icon className={`w-4 h-4 ${activeTab === id ? 'text-gold' : 'text-white/35'}`} />
                <span className={`text-[10px] font-bold tracking-wide ${activeTab === id ? 'text-gold' : 'text-white/35'}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-10 space-y-3">

          {/* ── Subscription tab ───────────────────────── */}
          {activeTab === 'subscription' && SUBSCRIPTION_PLANS.map((plan) => {
            const isPopular = plan.popular
            return (
              <button
                key={plan.id}
                onClick={() => handlePayment(plan.id, 'subscription')}
                disabled={!!loading}
                className="w-full p-4 rounded-[18px] text-left transition-all duration-150 active:scale-[0.97] relative overflow-hidden"
                style={isPopular ? {
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.05) 100%)',
                  border: '1px solid rgba(212,175,55,0.45)',
                  boxShadow: '0 0 24px rgba(212,175,55,0.12)',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                }}
              >
                {/* Popular shine */}
                {isPopular && (
                  <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                    style={{ background: 'radial-gradient(circle at 100% 0%, rgba(212,175,55,0.15) 0%, transparent 70%)' }} />
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                      style={isPopular ? {
                        background: 'linear-gradient(135deg,#D4AF37,#F5D85A)',
                        boxShadow: '0 0 12px rgba(212,175,55,0.4)',
                      } : { background: 'rgba(255,255,255,0.07)' }}>
                      <Crown className={`w-4 h-4 ${isPopular ? 'text-black' : 'text-white/50'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-[15px] tracking-tight">{plan.name}</span>
                        {isPopular && (
                          <span className="text-[9px] font-black text-black px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                            style={{ background: 'linear-gradient(135deg,#D4AF37,#F5D85A)' }}>
                            ХИТ
                          </span>
                        )}
                      </div>
                      <span className="text-white/35 text-[11px] flex items-center gap-0.5">{plan.coins_monthly} <Flame className="w-2.5 h-2.5 text-orange-400 fill-orange-400" /> в месяц</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-[22px] font-black leading-none" style={isPopular ? {
                      background: 'linear-gradient(135deg,#D4AF37,#F5D85A)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    } : { color: 'rgba(255,255,255,0.7)' }}>
                      {plan.price_rub}₽
                    </div>
                    <div className="text-white/30 text-[10px]">/месяц</div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {plan.perks.map((perk) => (
                    <div key={perk} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={isPopular ? { background: 'rgba(212,175,55,0.2)' } : { background: 'rgba(255,255,255,0.07)' }}>
                        <Check className={`w-2.5 h-2.5 ${isPopular ? 'text-gold' : 'text-white/40'}`} />
                      </div>
                      <span className="text-white/60 text-[12px]">{perk}</span>
                    </div>
                  ))}
                </div>

                {loading === plan.id && (
                  <div className="absolute inset-0 rounded-[18px] flex items-center justify-center"
                    style={{ background: 'rgba(11,11,15,0.7)' }}>
                    <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                  </div>
                )}
              </button>
            )
          })}

          {/* ── Coins tab ──────────────────────────────── */}
          {activeTab === 'coins' && (
            <div className="grid grid-cols-2 gap-3">
              {COIN_PACKS.map((pack) => {
                const isPopular = pack.popular
                return (
                  <button
                    key={pack.id}
                    onClick={() => handlePayment(pack.id, 'coins')}
                    disabled={!!loading}
                    className="relative p-4 rounded-[18px] text-left transition-all duration-150 active:scale-[0.93] overflow-hidden"
                    style={isPopular ? {
                      background: 'linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.05) 100%)',
                      border: '1px solid rgba(212,175,55,0.45)',
                      boxShadow: '0 0 20px rgba(212,175,55,0.12)',
                    } : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.09)',
                    }}
                  >
                    {isPopular && (
                      <span className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-wide text-black px-1.5 py-0.5 rounded-full"
                        style={{ background: 'linear-gradient(135deg,#D4AF37,#F5D85A)' }}>
                        ВЫГОДА
                      </span>
                    )}
                    <div className="mb-2">
                      <Flame className="w-7 h-7 text-orange-400 fill-orange-400" style={{ filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.6))' }} />
                    </div>
                    <div className="font-black text-white text-[18px] leading-tight">{pack.coins}</div>
                    <div className="text-white/40 text-[11px] mb-3">огоньков</div>
                    <div className="font-black text-[15px]" style={isPopular ? {
                      background: 'linear-gradient(135deg,#D4AF37,#F5D85A)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    } : { color: 'rgba(255,255,255,0.6)' }}>
                      {pack.price_rub}₽
                    </div>
                    {loading === pack.id && (
                      <div className="absolute inset-0 rounded-[18px] flex items-center justify-center"
                        style={{ background: 'rgba(11,11,15,0.7)' }}>
                        <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* ── Direct purchase tab ────────────────────── */}
          {activeTab === 'generation' && DIRECT_PRODUCTS.map((product) => (
            <button
              key={product.id}
              onClick={() => handlePayment(product.id, 'direct')}
              disabled={!!loading}
              className="w-full flex items-center justify-between p-4 rounded-[18px] transition-all duration-150 active:scale-[0.97] relative overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}>
                  {product.tier === 'premium'
                    ? <Sparkles className="w-5 h-5 text-gold" />
                    : <Zap className="w-5 h-5 text-gold" />
                  }
                </div>
                <div className="text-left">
                  <p className="font-bold text-white text-[14px] tracking-tight">{product.name}</p>
                  <p className="text-white/40 text-[12px] mt-0.5">{product.description}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <div className="font-black text-[18px]"
                  style={{ background: 'linear-gradient(135deg,#D4AF37,#F5D85A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {product.price_rub}₽
                </div>
                <div className="text-white/30 text-[10px]">1 раз</div>
              </div>
              {loading === product.id && (
                <div className="absolute inset-0 rounded-[18px] flex items-center justify-center"
                  style={{ background: 'rgba(11,11,15,0.7)' }}>
                  <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                </div>
              )}
            </button>
          ))}

          {/* CTA hint */}
          <p className="text-center text-white/20 text-[11px] pt-2">
            Оплата через Telegram · Безопасно
          </p>
        </div>
      </div>
    </div>
  )
}
