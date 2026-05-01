// src/store/alertStore.ts
import { create } from 'zustand'

interface AlertState {
  message: string | null
  type: 'timeout' | 'auth' | 'network' | 'error' | null
  showAlert: (message: string, type: 'timeout' | 'auth' | 'network' | 'error') => void
  clearAlert: () => void
}

export const useAlertStore = create<AlertState>((set) => ({
  message: null,
  type: null,
  showAlert: (message, type) => set({ message, type }),
  clearAlert: () => set({ message: null, type: null }),
}))
