import { useEffect, useState, useCallback } from 'react'
import { Sparkles, XCircle, Trophy } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { apiRoutes } from '../../api/client'
import { useTelegram } from '../../hooks/useTelegram'

const MESSAGES = [
  'Анализируем твоё фото...',
  'Применяем стиль...',
  'Создаём фотосессию...',
  'Шлифуем детали...',
  'Почти готово...',
]

export function GeneratingModal() {
  const { showGenerating, closeGenerating, generationId, setActiveTab } = useStore()
  const { haptic } = useTelegram()
  const [msgIdx, setMsgIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<string[] | null>(null)
  const [failed, setFailed] = useState(false)

  const poll = useCallback(async () => {
    if (!generationId) return
    try {
      const res = await apiRoutes.generations.get(generationId)
      const gen = res.data
      if (gen.status === 'completed') {
        setResult(gen.images)
        setProgress(100)
        haptic.success()
      } else if (gen.status === 'failed') {
        setFailed(true)
        haptic.error()
      }
    } catch {}
  }, [generationId, haptic])

  useEffect(() => {
    if (!showGenerating) {
      setMsgIdx(0)
      setProgress(0)
      setResult(null)
      setFailed(false)
      return
    }

    const msgTimer = setInterval(() => {
      setMsgIdx((i) => (i + 1) % MESSAGES.length)
    }, 3000)

    const progTimer = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 92))
    }, 600)

    const pollTimer = setInterval(poll, 4000)
    poll()

    const timeoutTimer = setTimeout(() => {
      setFailed(true)
      haptic.error()
    }, 120_000)

    return () => {
      clearInterval(msgTimer)
      clearInterval(progTimer)
      clearInterval(pollTimer)
      clearTimeout(timeoutTimer)
    }
  }, [showGenerating, poll])

  const handleView = () => {
    haptic.medium()
    closeGenerating()
    setActiveTab('sessions')
  }

  const handleRetry = () => {
    haptic.medium()
    closeGenerating()
  }

  if (!showGenerating) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-app-bg/95 backdrop-blur-md">
      {!result && !failed ? (
        <div className="flex flex-col items-center gap-8 px-8 text-center">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full border-4 border-gold/20 animate-spin-slow" />
            <div className="absolute inset-2 rounded-full border-4 border-t-gold border-transparent animate-spin" />
            <div className="absolute inset-4 rounded-full bg-gold/10 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-gold animate-float" />
            </div>
            <div className="absolute -inset-4 rounded-full bg-gold-radial opacity-60 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Создаём фотосессию</h2>
            <p className="text-white/60 text-base transition-all duration-500">
              {MESSAGES[msgIdx]}
            </p>
          </div>

          <div className="w-full max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/40 text-xs">Прогресс</span>
              <span className="text-gold font-bold text-xs">{progress}%</span>
            </div>
            <div className="h-1.5 bg-app-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-gradient rounded-full transition-all duration-700 ease-out shadow-gold-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <p className="text-white/30 text-sm">Обычно занимает 30–60 секунд</p>
        </div>
      ) : failed ? (
        <div className="flex flex-col items-center gap-6 px-8 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Не удалось создать</h2>
            <p className="text-white/50 mt-2 text-sm">Попробуй ещё раз с другим фото</p>
          </div>
          <button
            onClick={handleRetry}
            className="px-8 py-3 rounded-2xl bg-gold-gradient text-app-bg font-bold active:scale-95 transition-transform"
          >
            Попробовать снова
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 px-8 text-center w-full max-w-sm">
          <div className="relative">
            <div className="absolute -inset-2 rounded-3xl bg-gold-radial opacity-60" />
            <img
              src={result![0]}
              alt="Result"
              className="relative w-64 h-80 object-cover rounded-2xl shadow-gold"
            />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-black text-white">Готово!</h2>
            <Trophy className="w-6 h-6 text-gold" />
          </div>
            <p className="text-white/50 mt-1 text-sm">Твоя фотосессия создана</p>
          </div>

          <button
            onClick={handleView}
            className="w-full py-4 rounded-2xl bg-gold-gradient text-app-bg font-black text-base shadow-gold active:scale-95 transition-transform"
          >
            Посмотреть результат
          </button>
        </div>
      )}
    </div>
  )
}
