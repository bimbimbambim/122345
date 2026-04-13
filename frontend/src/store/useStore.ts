import { create } from 'zustand'
import { User, Style, GenerationTier, PaywallTab } from '../types'

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
  updateCoins: (coins: number) => void

  selectedStyle: Style | null
  setSelectedStyle: (style: Style | null) => void

  uploadedPhoto: string | null
  setUploadedPhoto: (photo: string | null) => void

  selectedTier: GenerationTier
  setSelectedTier: (tier: GenerationTier) => void

  generationId: string | null
  setGenerationId: (id: string | null) => void

  showPaywall: boolean
  paywallTab: PaywallTab
  openPaywall: (tab?: PaywallTab) => void
  closePaywall: () => void

  showStyleDetail: boolean
  openStyleDetail: () => void
  closeStyleDetail: () => void

  showUpload: boolean
  openUpload: () => void
  closeUpload: () => void

  showGenerating: boolean
  openGenerating: () => void
  closeGenerating: () => void

  activeTab: 'home' | 'trends' | 'sessions' | 'profile'
  setActiveTab: (tab: 'home' | 'trends' | 'sessions' | 'profile') => void
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateCoins: (coins) =>
    set((state) =>
      state.user ? { user: { ...state.user, fire_coins: coins } } : {}
    ),

  selectedStyle: null,
  setSelectedStyle: (style) => set({ selectedStyle: style }),

  uploadedPhoto: null,
  setUploadedPhoto: (photo) => set({ uploadedPhoto: photo }),

  selectedTier: 'standard',
  setSelectedTier: (tier) => set({ selectedTier: tier }),

  generationId: null,
  setGenerationId: (id) => set({ generationId: id }),

  showPaywall: false,
  paywallTab: 'generation',
  openPaywall: (tab = 'generation') => set({ showPaywall: true, paywallTab: tab }),
  closePaywall: () => set({ showPaywall: false }),

  showStyleDetail: false,
  openStyleDetail: () => set({ showStyleDetail: true }),
  closeStyleDetail: () => set({ showStyleDetail: false }),

  showUpload: false,
  openUpload: () => set({ showUpload: true }),
  closeUpload: () => set({ showUpload: false }),

  showGenerating: false,
  openGenerating: () => set({ showGenerating: true }),
  closeGenerating: () => set({ showGenerating: false }),

  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
