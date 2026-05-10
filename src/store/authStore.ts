import { create } from 'zustand'
import api from '../services/api'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),

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
}))
