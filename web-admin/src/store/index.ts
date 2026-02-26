import { create } from 'zustand'
import { Audiencia, DashboardKPIs } from '../models/types'

interface AppState {
  audiencias: Audiencia[]
  audienciaSelecionada: Audiencia | null
  dashboard: DashboardKPIs | null
  isLoading: boolean
  error: string | null

  setAudiencias: (list: Audiencia[]) => void
  setAudienciaSelecionada: (a: Audiencia | null) => void
  setDashboard: (d: DashboardKPIs) => void
  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  audiencias: [],
  audienciaSelecionada: null,
  dashboard: null,
  isLoading: false,
  error: null,
  setAudiencias: (list) => set({ audiencias: list }),
  setAudienciaSelecionada: (a) => set({ audienciaSelecionada: a }),
  setDashboard: (d) => set({ dashboard: d }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (e) => set({ error: e }),
}))
