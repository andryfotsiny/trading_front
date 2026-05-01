// src/services/api.ts
import axios from 'axios'
import { useToastStore } from '../store/toastStore'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const data = err.response?.data
    const errorType = data?.error_type
    const detail = data?.detail || ''

    if (status === 401 && !err.config.url?.includes('/auth/')) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(err)
    }

    const { addToast } = useToastStore.getState()

    if (errorType === 'exchange_timeout' || status === 503) {
      addToast('warning', 'Timeout Binance testnet. Le serveur de test est lent. Reessayez dans quelques minutes.')
    } else if (errorType === 'exchange_auth') {
      addToast('error', 'Cle API Binance invalide. Verifiez votre .env ou regenerez les cles testnet.')
    } else if (errorType === 'insufficient_funds') {
      addToast('error', 'Fonds insuffisants sur votre compte Binance.')
    } else if (errorType === 'invalid_order') {
      addToast('error', 'Ordre invalide. Verifiez le symbole et la quantite.')
    } else if (status === 500) {
      if (detail.toLowerCase().includes('timeout') || detail.toLowerCase().includes('binance')) {
        addToast('warning', 'Timeout Binance testnet. Reessayez dans quelques minutes.')
      } else {
        addToast('error', detail || 'Erreur serveur inattendue.')
      }
    } else if (status === 422) {
      addToast('error', 'Donnees invalides. Verifiez les champs.')
    }

    return Promise.reject(err)
  }
)

export default api
