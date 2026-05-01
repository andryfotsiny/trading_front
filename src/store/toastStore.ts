// src/store/toastStore.ts
import { create } from 'zustand'
import type { ToastData } from '../components/UI/Toast'

interface ToastState {
  toasts: ToastData[]
  addToast: (type: ToastData['type'], message: string) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = Date.now().toString()
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }))
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))
