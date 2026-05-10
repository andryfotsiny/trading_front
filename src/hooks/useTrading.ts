import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.get('/dashboard/stats').then((r) => r.data),
    refetchInterval: 30000,
  })
}

export function useStrategyStats() {
  return useQuery({
    queryKey: ['dashboard', 'strategy-stats'],
    queryFn: () => api.get('/dashboard/strategy-stats').then((r) => r.data),
    refetchInterval: 30000,
  })
}

export function useOpenTrades() {
  return useQuery({
    queryKey: ['trading', 'open-trades'],
    queryFn: () => api.get('/trading/open-trades').then((r) => r.data),
    refetchInterval: 15000,
  })
}

export function useTradeHistory(limit = 100) {
  return useQuery({
    queryKey: ['trading', 'history', limit],
    queryFn: () => api.get(`/trading/history?limit=${limit}`).then((r) => r.data),
  })
}

export function useBtcPrice() {
  return useQuery({
    queryKey: ['market', 'price', 'BTC/USDT'],
    queryFn: () => api.get('/market/price/BTC/USDT').then((r) => r.data.price),
    refetchInterval: 10000,
  })
}

export function useBalance() {
  return useQuery({
    queryKey: ['exchanges', 'balance'],
    queryFn: () => api.get('/exchanges/balance').then((r) => r.data),
    refetchInterval: 60000,
    retry: 1,
  })
}

export function useIndicators(base = 'BTC', quote = 'USDT') {
  return useQuery({
    queryKey: ['signals', 'indicators', base, quote],
    queryFn: () => api.get(`/signals/indicators/${base}/${quote}`).then((r) => r.data),
    refetchInterval: 30000,
    retry: 1,
  })
}

export function useBotStatus() {
  return useQuery({
    queryKey: ['bot', 'status'],
    queryFn: () => api.get('/bot/status').then((r) => r.data),
    refetchInterval: 30000,
  })
}

export function useStrategies() {
  return useQuery({
    queryKey: ['strategies'],
    queryFn: () => api.get('/strategies/').then((r) => r.data),
  })
}

export function useStrategyTypes() {
  return useQuery({
    queryKey: ['strategies', 'types'],
    queryFn: () => api.get('/strategies/types').then((r) => r.data.available),
  })
}

export function useCloseTrade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.post(`/trading/close/${id}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trading'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useCheckExits() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/trading/check-exits').then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trading'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useRunBot() {
  return useMutation({
    mutationFn: () => api.post('/bot/run-now').then((r) => r.data),
  })
}

export function useToggleStrategy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      api.post(`/strategies/${id}/${active ? 'deactivate' : 'activate'}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] })
    },
  })
}

export function useCreateStrategy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/strategies/', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] })
    },
  })
}

export function useDeleteStrategy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/strategies/${id}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] })
    },
  })
}
