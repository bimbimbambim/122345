import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { api } from '../api'

interface Style {
  id: string; name: string; category: string; image: string
  price_fast: number; price_standard: number; price_premium: number
  badge: string | null; tags: string[]; prompt: string
  trending: boolean; popular: boolean; is_new: boolean
  is_active: boolean; sort_order: number
}

const EMPTY: Omit<Style, 'id'> & { id: string } = {
  id: '', name: '', category: 'standard', image: '', price_fast: 5,
  price_standard: 10, price_premium: 20, badge: '', tags: [], prompt: '',
  trending: false, popular: false, is_new: false, is_active: true, sort_order: 0,
}

function Modal({ style, onSave, onClose }: {
  style: Style | null
  onSave: (data: object, isNew: boolean) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<typeof EMPTY>(style ? { ...style, badge: style.badge || '' } : { ...EMPTY })
  const [tagsStr, setTagsStr] = useState((style?.tags || []).join(', '))
  const [saving, setSaving] = useState(false)

  const isNew = !style

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const data = { ...form, tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean), badge: form.badge || null }
    try { await onSave(data, isNew) } finally { setSaving(false) }
  }

  const inp = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/40'
  const lbl = 'text-xs font-semibold text-white/40 uppercase tracking-wider mb-1 block'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="bg-[#161b27] border border-white/[0.1] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-black text-white mb-5">{isNew ? 'Новый стиль' : `Редактировать: ${style!.name}`}</h2>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>ID (slug)</label>
              <input className={inp} value={form.id} onChange={e => set('id', e.target.value)} placeholder="my_style" disabled={!isNew} />
            </div>
            <div><label className={lbl}>Категория</label>
              <select className={inp} value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="standard">standard</option>
                <option value="premium">premium</option>
              </select>
            </div>
          </div>
          <div><label className={lbl}>Название</label>
            <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div><label className={lbl}>URL изображения</label>
            <input className={inp} value={form.image} onChange={e => set('image', e.target.value)} required placeholder="https://..." />
            {form.image && <img src={form.image} alt="" className="mt-2 h-24 w-full object-cover rounded-lg" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={lbl}>Цена Fast</label><input type="number" className={inp} value={form.price_fast} onChange={e => set('price_fast', +e.target.value)} /></div>
            <div><label className={lbl}>Цена Std</label><input type="number" className={inp} value={form.price_standard} onChange={e => set('price_standard', +e.target.value)} /></div>
            <div><label className={lbl}>Цена Premium</label><input type="number" className={inp} value={form.price_premium} onChange={e => set('price_premium', +e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Badge (опц.)</label><input className={inp} value={form.badge || ''} onChange={e => set('badge', e.target.value)} placeholder="VIP" /></div>
            <div><label className={lbl}>Sort order</label><input type="number" className={inp} value={form.sort_order} onChange={e => set('sort_order', +e.target.value)} /></div>
          </div>
          <div><label className={lbl}>Теги (через запятую)</label>
            <input className={inp} value={tagsStr} onChange={e => setTagsStr(e.target.value)} placeholder="cinematic, dark, moody" />
          </div>
          <div><label className={lbl}>Промпт</label>
            <textarea className={inp + ' min-h-[80px] resize-none'} value={form.prompt} onChange={e => set('prompt', e.target.value)} />
          </div>
          <div className="flex gap-6">
            {([['trending','Trending'],['popular','Popular'],['is_new','Новинка'],['is_active','Активен']] as [string,string][]).map(([k,l]) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[k as keyof typeof form] as boolean}
                  onChange={e => set(k, e.target.checked)}
                  className="w-4 h-4 accent-yellow-400" />
                <span className="text-sm text-white/60">{l}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 text-sm hover:bg-white/5">Отмена</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg font-bold text-sm text-black disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#D4AF37,#F5D85A)' }}>
              {saving ? 'Сохраняем...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function StylesPage() {
  const [styles, setStyles] = useState<Style[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Style | null | 'new'>()
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    api.styles.list().then(r => setStyles(r.data)).catch(() => setError('Ошибка загрузки')).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleSave = async (data: object, isNew: boolean) => {
    if (isNew) await api.styles.create(data)
    else await api.styles.update((data as { id: string }).id, data)
    setEditing(undefined)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`Удалить стиль "${id}"?`)) return
    await api.styles.delete(id)
    load()
  }

  const toggleActive = async (s: Style) => {
    await api.styles.update(s.id, { ...s, is_active: !s.is_active })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Стили</h1>
          <p className="text-white/40 text-sm mt-0.5">{styles.length} стилей в базе</p>
        </div>
        <button onClick={() => setEditing('new')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-black"
          style={{ background: 'linear-gradient(135deg,#D4AF37,#F5D85A)' }}>
          <Plus className="w-4 h-4" /> Добавить стиль
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-[#161b27] border border-white/[0.07] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Стиль','ID','Категория','Цены (F/S/P)','Флаги','Действия'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-white/30 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {styles.map(s => (
                <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={s.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                      <span className="font-semibold text-white">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/40 font-mono text-xs">{s.id}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.category === 'premium' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-blue-500/15 text-blue-400'}`}>
                      {s.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">{s.price_fast} / {s.price_standard} / {s.price_premium}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {s.trending && <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-500/15 text-orange-400">hot</span>}
                      {s.is_new    && <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400">new</span>}
                      {s.popular   && <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/15 text-purple-400">pop</span>}
                      {!s.is_active && <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400">off</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleActive(s)} className="text-white/30 hover:text-white/70 transition-colors" title={s.is_active ? 'Скрыть' : 'Показать'}>
                        {s.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setEditing(s)} className="text-white/30 hover:text-yellow-400 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(s.id)} className="text-white/30 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== undefined && (
        <Modal
          style={editing === 'new' ? null : editing}
          onSave={handleSave}
          onClose={() => setEditing(undefined)}
        />
      )}
    </div>
  )
}
