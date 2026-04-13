import { useState, useRef } from 'react'
import { X, Camera, ImageIcon, AlertCircle, Loader2, Flame, Sparkles, Zap, Crown } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useTelegram } from '../../hooks/useTelegram'
import { apiRoutes } from '../../api/client'

export function UploadModal() {
  const {
    showUpload, closeUpload, selectedStyle, selectedTier,
    setUploadedPhoto, setGenerationId, openGenerating, openPaywall,
    user, setUser,
  } = useStore()
  const { haptic } = useTelegram()

  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!showUpload) return null

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Загрузите изображение')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Файл слишком большой (макс 10 МБ)')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleGenerate = async () => {
    if (!preview || !selectedStyle) return
    haptic.medium()

    const cost = selectedTier === 'fast'
      ? selectedStyle.price_fast
      : selectedTier === 'premium'
      ? selectedStyle.price_premium
      : selectedStyle.price_standard

    if (!user?.free_used && user?.fire_coins === 0) {
      closeUpload()
      openPaywall('generation')
      return
    }
    if (user && user.fire_coins < cost && user.free_used) {
      closeUpload()
      openPaywall('generation')
      return
    }

    setLoading(true)
    try {
      const base64 = preview.split(',')[1]
      const res = await apiRoutes.generations.create({
        style_id: selectedStyle.id,
        tier: selectedTier,
        photo_base64: base64,
      })
      setGenerationId(res.data.id)
      setUploadedPhoto(preview)
      const userRes = await apiRoutes.user.me()
      setUser(userRes.data)
      closeUpload()
      openGenerating()
    } catch (err: unknown) {
      haptic.error()
      const msg = err instanceof Error ? err.message : 'Ошибка генерации'
      if (msg.includes('лицо') || msg.includes('face')) {
        setError('Не удалось распознать лицо. Загрузите более чёткое селфи')
      } else if (msg.includes('четк') || msg.includes('blur')) {
        setError('Загрузите более чёткое селфи')
      } else if (msg.includes('монет') || msg.includes('coin') || msg.includes('баланс')) {
        closeUpload()
        openPaywall('generation')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const tierCost = selectedStyle
    ? selectedTier === 'fast'
      ? selectedStyle.price_fast
      : selectedTier === 'premium'
      ? selectedStyle.price_premium
      : selectedStyle.price_standard
    : 0

  const TIER_INFO = {
    fast:     { Icon: Zap,      label: 'FAST',     desc: '~30 сек',   color: 'rgba(96,165,250,1)',  glow: 'rgba(59,130,246,0.25)',  border: 'rgba(59,130,246,0.35)' },
    standard: { Icon: Sparkles, label: 'СТАНДАРТ', desc: '~60 сек',   color: 'rgba(212,175,55,1)',  glow: 'rgba(212,175,55,0.2)',   border: 'rgba(212,175,55,0.35)' },
    premium:  { Icon: Crown,    label: 'ПРЕМИУМ',  desc: 'HD качество', color: 'rgba(168,85,247,1)', glow: 'rgba(168,85,247,0.25)', border: 'rgba(168,85,247,0.35)' },
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end">
      <div
        className="absolute inset-0 bg-black/75"
        style={{ backdropFilter: 'blur(12px)' }}
        onClick={() => { closeUpload(); setPreview(null); setError(null) }}
      />

      <div className="relative w-full animate-slide-up"
        style={{
          background: 'linear-gradient(180deg, #14141E 0%, #0E0E18 100%)',
          borderTop: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '26px 26px 0 0',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}>

        {/* Top ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-16 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.18) 0%, transparent 70%)' }} />

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-[3px] rounded-full bg-white/15" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-2 pb-4">
          <div>
            <h2 className="text-[20px] font-black text-white tracking-tight">Загрузи фото</h2>
            {selectedStyle && (
              <p className="text-white/35 text-[13px] mt-0.5">Стиль: {selectedStyle.name}</p>
            )}
          </div>
          <button
            onClick={() => { closeUpload(); setPreview(null); setError(null) }}
            className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform mt-1"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <div className="px-4 pb-10 space-y-3">
          {/* Photo upload area */}
          {!preview ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full h-44 rounded-[18px] flex flex-col items-center justify-center gap-3 active:scale-[0.98] transition-transform"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1.5px dashed rgba(212,175,55,0.3)',
                boxShadow: '0 0 20px rgba(212,175,55,0.06)',
              }}>
              <div className="w-14 h-14 rounded-[18px] flex items-center justify-center"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}>
                <Camera className="w-7 h-7 text-gold" />
              </div>
              <div className="text-center">
                <p className="font-black text-white text-[14px] tracking-tight">Загрузить фото</p>
                <p className="text-white/35 text-[12px] mt-0.5">Селфи или портретное фото</p>
              </div>
            </button>
          ) : (
            <div className="relative">
              <img src={preview} alt="Preview"
                className="w-full h-52 object-cover rounded-[18px]" />
              <button
                onClick={() => { setPreview(null); setError(null) }}
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <ImageIcon className="w-3 h-3 text-white/60" />
                <span className="text-white/60 text-[11px] font-medium">Фото загружено</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-[14px]"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-[13px]">{error}</p>
            </div>
          )}

          {/* Tier selector */}
          <div className="grid grid-cols-3 gap-2">
            {(['fast', 'standard', 'premium'] as const).map((t) => {
              const info = TIER_INFO[t]
              const cost = selectedStyle
                ? t === 'fast' ? selectedStyle.price_fast
                : t === 'premium' ? selectedStyle.price_premium
                : selectedStyle.price_standard
                : 0
              const { setSelectedTier } = useStore.getState()
              const isActive = selectedTier === t
              return (
                <button
                  key={t}
                  onClick={() => { haptic.selection(); setSelectedTier(t) }}
                  className="py-3 rounded-[14px] text-center transition-all duration-150 active:scale-95"
                  style={isActive ? {
                    background: `${info.glow.replace('0.25)', '0.12)')}`,
                    border: `1px solid ${info.border}`,
                    boxShadow: `0 0 14px ${info.glow}`,
                  } : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                  <info.Icon className="w-4 h-4 mx-auto mb-1" style={{ color: isActive ? info.color : 'rgba(255,255,255,0.3)' }} />
                  <p className="text-[10px] font-black uppercase tracking-wide" style={{ color: isActive ? info.color : 'rgba(255,255,255,0.4)' }}>
                    {info.label}
                  </p>
                  <p className="text-[11px] text-white/30 mt-0.5">{info.desc}</p>
                  <p className="text-[13px] font-black mt-1 flex items-center justify-center gap-0.5"
                    style={{ color: isActive ? info.color : 'rgba(255,255,255,0.6)' }}>
                    <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />{cost}
                  </p>
                </button>
              )
            })}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />

          {/* CTA */}
          <button
            onClick={handleGenerate}
            disabled={!preview || loading}
            className="w-full py-4 rounded-[16px] font-black text-[15px] text-black tracking-tight active:scale-[0.97] transition-all duration-150 flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg,#D4AF37 0%,#F5D85A 50%,#B8960C 100%)',
              boxShadow: preview ? '0 0 24px rgba(212,175,55,0.5), 0 4px 16px rgba(0,0,0,0.3)' : 'none',
            }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.18) 0%,transparent 60%)' }} />
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin relative" />
                <span className="relative">Запускаем...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 relative" />
                <span className="relative">Создать фото</span>
                <span className="relative text-black/50 text-[13px] flex items-center gap-0.5">
                  <Flame className="w-3 h-3" />{tierCost}
                </span>
              </>
            )}
          </button>

          <p className="text-white/25 text-[11px] text-center">
            Убедись что лицо хорошо видно · Портретное фото
          </p>
        </div>
      </div>
    </div>
  )
}
