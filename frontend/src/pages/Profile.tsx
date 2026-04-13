import { useEffect, useState } from 'react'
import { Crown, ChevronRight, Copy, Check, Sparkles, Flame, Users, BarChart2, ClipboardList, CreditCard, Zap } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useTelegram } from '../hooks/useTelegram'
import { apiRoutes } from '../api/client'
import type { Transaction } from '../types'

export function Profile() {
  const { user, openPaywall } = useStore()
  const { haptic, tg, user: tgUser } = useTelegram()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txLoading, setTxLoading] = useState(false)
  const [referrals, setReferrals] = useState<{ count: number; earned: number }>({ count: 0, earned: 0 })
  const [tab, setTab] = useState<'stats' | 'history' | 'referrals'>('stats')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      setTxLoading(true)
      try {
        const [txRes, refRes] = await Promise.all([
          apiRoutes.user.transactions(),
          apiRoutes.user.referrals(),
        ])
        setTransactions(txRes.data)
        setReferrals(refRes.data)
      } catch {} finally { setTxLoading(false) }
    }
    load()
  }, [])

  const referralLink = `https://t.me/lensy_ai_bot?start=ref_${user?.referral_code || ''}`

  const copyReferral = () => {
    haptic.medium()
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const shareReferral = () => {
    haptic.medium()
    if (tg) tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('🔥 Создай профессиональное AI фото с LENSY AI!')}`)
  }

  const planLabel = (plan: string) => ({ basic: 'BASIC', pro: 'PRO', max: 'MAX' }[plan] ?? plan.toUpperCase())

  const TX_META = {
    purchase:     { Icon: CreditCard, color: 'rgba(212,175,55,1)',   bg: 'rgba(212,175,55,0.12)' },
    generation:   { Icon: Sparkles,   color: 'rgba(168,85,247,1)',   bg: 'rgba(168,85,247,0.12)' },
    referral:     { Icon: Users,      color: 'rgba(59,130,246,1)',   bg: 'rgba(59,130,246,0.12)' },
    subscription: { Icon: Crown,      color: 'rgba(212,175,55,1)',   bg: 'rgba(212,175,55,0.12)' },
  }
  const txMeta = (type: string) =>
    TX_META[type as keyof typeof TX_META] ?? { Icon: Zap, color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.07)' }

  const TABS = [
    { id: 'stats'     as const, Icon: BarChart2,     label: 'Обзор' },
    { id: 'history'   as const, Icon: ClipboardList,  label: 'История' },
    { id: 'referrals' as const, Icon: Users,          label: 'Рефералы' },
  ]

  const avatarName = tgUser?.first_name || user?.first_name || 'U'

  return (
    <div className="flex flex-col min-h-screen bg-app-bg pb-28">

      {/* ── Hero header ──────────────────────────────── */}
      <div className="relative px-4 pt-6 pb-5 overflow-hidden">
        {/* Background orb */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-40 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.12) 0%, transparent 70%)' }} />

        <div className="relative flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-[68px] h-[68px] rounded-[22px] overflow-hidden"
              style={{
                background: 'linear-gradient(135deg,rgba(212,175,55,0.15),rgba(212,175,55,0.05))',
                border: '1.5px solid rgba(212,175,55,0.35)',
                boxShadow: '0 0 20px rgba(212,175,55,0.2)',
              }}>
              {tgUser?.photo_url ? (
                <img src={tgUser.photo_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[26px] font-black text-gradient-gold">
                    {avatarName[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {user?.subscription && (
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#D4AF37,#F5D85A)', boxShadow: '0 0 8px rgba(212,175,55,0.6)' }}>
                <Crown className="w-3 h-3 text-black" />
              </div>
            )}
          </div>

          {/* Name & plan */}
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-[19px] text-white tracking-tight truncate leading-tight">
              {tgUser?.first_name || user?.first_name || 'Пользователь'}
            </h2>
            {tgUser?.username && (
              <p className="text-white/35 text-[12px] mt-0.5">@{tgUser.username}</p>
            )}
            <div className="mt-1.5">
              {user?.subscription ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-black px-2.5 py-1 rounded-full"
                  style={{ background: 'linear-gradient(135deg,#D4AF37,#F5D85A)', boxShadow: '0 0 10px rgba(212,175,55,0.4)' }}>
                  <Crown className="w-2.5 h-2.5" />
                  {planLabel(user.subscription.plan)}
                </span>
              ) : (
                <span className="inline-flex items-center text-[10px] font-bold text-white/35 border border-white/12 px-2.5 py-1 rounded-full">
                  FREE
                </span>
              )}
            </div>
          </div>

          {/* Settings */}
        </div>
      </div>

      {/* ── Stats strip ──────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5 px-4 mb-4">
        {[
          { Icon: Flame,    iconColor: 'rgba(249,115,22,1)',  value: user?.fire_coins ?? 0,       label: 'Огоньков', glow: 'rgba(249,115,22,0.25)' },
          { Icon: Sparkles, iconColor: 'rgba(168,85,247,1)',  value: user?.total_generations ?? 0, label: 'Генераций', glow: 'rgba(168,85,247,0.2)' },
          { Icon: Users,    iconColor: 'rgba(96,165,250,1)',  value: referrals.count,              label: 'Рефералов', glow: 'rgba(59,130,246,0.2)' },
        ].map(({ Icon, iconColor, value, label, glow }) => (
          <div key={label} className="flex flex-col items-center py-3.5 px-2 rounded-[16px]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: `0 0 16px ${glow}`,
            }}>
            <Icon className="w-5 h-5 mb-1.5" style={{ color: iconColor, filter: `drop-shadow(0 0 5px ${glow})` }} />
            <span className="font-black text-[18px] text-white leading-none tabular-nums">{value}</span>
            <span className="text-white/30 text-[9px] uppercase tracking-wide mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Subscription card ────────────────────────── */}
      {!user?.subscription ? (
        <div className="mx-4 mb-4">
          <button
            onClick={() => { haptic.medium(); openPaywall('subscription') }}
            className="w-full relative overflow-hidden flex items-center justify-between p-4 rounded-[18px] active:scale-[0.97] transition-transform"
            style={{
              background: 'linear-gradient(135deg,rgba(212,175,55,0.13) 0%,rgba(212,175,55,0.05) 100%)',
              border: '1px solid rgba(212,175,55,0.35)',
              boxShadow: '0 0 24px rgba(212,175,55,0.1)',
            }}>
            <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 100% 0%, rgba(212,175,55,0.12) 0%, transparent 70%)' }} />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#D4AF37,#F5D85A)', boxShadow: '0 0 12px rgba(212,175,55,0.4)' }}>
                <Crown className="w-5 h-5 text-black" />
              </div>
              <div className="text-left">
                <p className="font-black text-white text-[14px] tracking-tight">Получить PRO</p>
                <p className="text-white/40 text-[12px] flex items-center gap-1">140 <Flame className="w-3 h-3 text-orange-400 fill-orange-400" /> + все премиум стили</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gold/60 flex-shrink-0" />
          </button>
        </div>
      ) : (
        <div className="mx-4 mb-4">
          <div className="relative overflow-hidden p-4 rounded-[18px]"
            style={{
              background: 'linear-gradient(135deg,rgba(212,175,55,0.13) 0%,rgba(212,175,55,0.05) 100%)',
              border: '1px solid rgba(212,175,55,0.35)',
            }}>
            <div className="absolute top-0 right-0 w-28 h-28 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 100% 0%, rgba(212,175,55,0.15) 0%, transparent 70%)' }} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#D4AF37,#F5D85A)' }}>
                  <Crown className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="font-black text-white text-[14px]">{planLabel(user.subscription.plan)} подписка</p>
                  <p className="text-white/40 text-[11px] flex items-center gap-1">
                    до {new Date(user.subscription.expires_at).toLocaleDateString('ru-RU')} · {user.subscription.fire_coins_monthly} <Flame className="w-2.5 h-2.5 text-orange-400 fill-orange-400" />/мес
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-[10px] font-bold">Активна</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs ─────────────────────────────────────── */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          {TABS.map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => { haptic.selection(); setTab(id) }}
              className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-[14px] transition-all duration-200 active:scale-95"
              style={tab === id ? {
                background: 'linear-gradient(135deg,rgba(212,175,55,0.18),rgba(212,175,55,0.07))',
                border: '1px solid rgba(212,175,55,0.4)',
                boxShadow: '0 0 14px rgba(212,175,55,0.12)',
              } : {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}>
              <Icon className={`w-4 h-4 ${tab === id ? 'text-gold' : 'text-white/30'}`} />
              <span className={`text-[10px] font-bold tracking-wide ${tab === id ? 'text-gold' : 'text-white/30'}`}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats tab ────────────────────────────────── */}
      {tab === 'stats' && (
        <div className="px-4 space-y-3">
          {/* Balance bar */}
          <div className="p-4 rounded-[18px]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-bold text-white/70">Баланс огоньков</span>
              <span className="font-black text-gold text-[15px] tabular-nums flex items-center gap-1">{user?.fire_coins ?? 0} <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" /></span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min((user?.fire_coins ?? 0) / 300 * 100, 100)}%`,
                  background: 'linear-gradient(90deg,#D4AF37,#F5D85A)',
                  boxShadow: '0 0 8px rgba(212,175,55,0.6)',
                }} />
            </div>
          </div>

          {/* Action rows */}
          {([
            { Icon: Flame,    iconColor: 'rgba(249,115,22,1)', title: 'Купить огоньки',     sub: 'От 100₽ за 40 огоньков',     action: 'coins'        as const, iconBg: 'rgba(249,115,22,0.12)',  iconBorder: 'rgba(249,115,22,0.25)',  glow: 'rgba(249,115,22,0.15)' },
            { Icon: Sparkles, iconColor: 'rgba(168,85,247,1)', title: 'Разовая генерация', sub: 'От 129₽ без подписки',       action: 'generation'   as const, iconBg: 'rgba(168,85,247,0.12)', iconBorder: 'rgba(168,85,247,0.25)', glow: 'rgba(168,85,247,0.12)' },
            { Icon: Crown,    iconColor: 'rgba(212,175,55,1)', title: 'PRO подписка',      sub: '499₽/мес — 140 + все стили', action: 'subscription' as const, iconBg: 'rgba(212,175,55,0.12)',  iconBorder: 'rgba(212,175,55,0.25)',  glow: 'rgba(212,175,55,0.15)' },
          ]).map(({ Icon, iconColor, title, sub, action, iconBg, iconBorder, glow }) => (
            <button
              key={title}
              onClick={() => { haptic.medium(); openPaywall(action) }}
              className="w-full flex items-center justify-between p-4 rounded-[16px] active:scale-[0.97] transition-transform"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: `0 0 16px ${glow}` }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
                  style={{ background: iconBg, border: `1px solid ${iconBorder}` }}>
                  <Icon className="w-4 h-4" style={{ color: iconColor }} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white text-[13px]">{title}</p>
                  <p className="text-white/35 text-[11px] mt-0.5">{sub}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/25 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* ── History tab ──────────────────────────────── */}
      {tab === 'history' && (
        <div className="px-4 space-y-2">
          {txLoading ? (
            [1,2,3].map(i => (
              <div key={i} className="h-[66px] rounded-[14px] shimmer-bg" />
            ))
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <div className="w-14 h-14 rounded-[18px] flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Sparkles className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-white/40 text-[14px] font-semibold">История пуста</p>
              <p className="text-white/20 text-[12px] mt-1">Транзакции появятся после первой операции</p>
            </div>
          ) : transactions.map((tx) => {
            const meta = txMeta(tx.type)
            return (
              <div key={tx.id} className="flex items-center gap-3 p-3.5 rounded-[14px]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{ background: meta.bg }}>
                  <meta.Icon className="w-4.5 h-4.5" style={{ color: meta.color, width: 18, height: 18 }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-[13px] truncate">{tx.description}</p>
                  <p className="text-white/30 text-[11px] mt-0.5">
                    {new Date(tx.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-black text-[14px] ${tx.coins_change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.coins_change > 0 ? '+' : ''}{tx.coins_change} <Flame className="inline w-3 h-3 text-orange-400 fill-orange-400" />
                  </p>
                  {tx.amount > 0 && (
                    <p className="text-white/25 text-[10px]">{tx.amount}₽</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Referrals tab ────────────────────────────── */}
      {tab === 'referrals' && (
        <div className="px-4 space-y-3">
          {/* Reward cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: '+20', label: 'Тебе за каждого', glow: 'rgba(212,175,55,0.2)' },
              { value: '+10', label: 'Другу при входе', glow: 'rgba(59,130,246,0.2)' },
            ].map(({ value, label, glow }) => (
              <div key={label} className="py-4 px-3 rounded-[16px] text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: `0 0 16px ${glow}` }}>
                <p className="text-[22px] font-black text-white leading-tight flex items-center justify-center gap-1">{value}<Flame className="w-4 h-4 text-orange-400 fill-orange-400" /></p>
                <p className="text-white/35 text-[10px] mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Referral link */}
          <div className="p-4 rounded-[18px]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wide mb-2.5">Твоя ссылка</p>
            <div className="flex items-center gap-2 p-3 rounded-[12px]"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-white/50 text-[11px] flex-1 truncate font-mono">{referralLink}</p>
              <button
                onClick={copyReferral}
                className="w-8 h-8 rounded-[10px] flex items-center justify-center active:scale-90 transition-all flex-shrink-0"
                style={copied ? {
                  background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)',
                } : {
                  background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)',
                }}>
                {copied
                  ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                  : <Copy className="w-3.5 h-3.5 text-gold" />
                }
              </button>
            </div>
          </div>

          {/* Share button */}
          <button
            onClick={shareReferral}
            className="w-full py-4 rounded-[16px] font-black text-[15px] text-black tracking-tight active:scale-[0.97] transition-transform relative overflow-hidden flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg,#D4AF37 0%,#F5D85A 50%,#B8960C 100%)',
              boxShadow: '0 0 24px rgba(212,175,55,0.5), 0 4px 16px rgba(0,0,0,0.3)',
            }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.18) 0%,transparent 60%)' }} />
            <Users className="w-4 h-4 relative" />
            <span className="relative">Пригласить друга</span>
          </button>

          {/* Stats row */}
          <div className="flex items-center justify-between p-4 rounded-[16px]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <p className="font-black text-white text-[20px] tabular-nums">{referrals.count}</p>
              <p className="text-white/30 text-[11px]">приглашённых друзей</p>
            </div>
            <div className="h-10 w-px bg-white/8" />
            <div className="text-right">
              <p className="font-black text-[20px] tabular-nums text-gradient-gold">{referrals.earned}</p>
              <p className="text-white/30 text-[11px] flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-400 fill-orange-400" /> заработано</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
