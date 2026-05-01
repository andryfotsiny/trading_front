// src/store/index.ts
import { create } from 'zustand'
import api from '../services/api'
import type { User, Trade, Strategy, Indicators } from '../types'

interface AppState {
  user: User | null
  token: string | null
  trades: Trade[]
  strategies: Strategy[]
  indicators: Indicators | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
  fetchTrades: () => Promise<void>
  fetchStrategies: () => Promise<void>
  fetchIndicators: (base: string, quote: string) => Promise<void>
}

export const useStore = create<AppState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  trades: [],
  strategies: [],
  indicators: null,
  loading: false,

  login: async (email, password) => {
    const form = new FormData()
    form.append('username', email)
    form.append('password', password)
    const { data } = await api.post('/auth/login', form)
    localStorage.setItem('token', data.access_token)
    set({ token: data.access_token })
  },

  register: async (email, username, password) => {
    await api.post('/auth/register', { email, username, password })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  fetchMe: async () => {
    const { data } = await api.get('/users/me')
    set({ user: data })
  },

  fetchTrades: async () => {
    const open = await api.get('/trading/open-trades')
    set({ trades: open.data })
  },

  fetchStrategies: async () => {
    const { data } = await api.get('/strategies/')
    set({ strategies: data })
  },

  fetchIndicators: async (base, quote) => {
    set({ loading: true })
    const { data } = await api.get(`/signals/indicators/${base}/${quote}`)
    set({ indicators: data, loading: false })
  },
}))
