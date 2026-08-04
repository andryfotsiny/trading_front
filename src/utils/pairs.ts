export interface TradingPair {
  value: string
  label: string
}

export const TRADING_PAIRS: TradingPair[] = [
  { value: 'BTC/USDT', label: 'BTC/USDT' },
  { value: 'PAXG/USDT', label: 'Or (PAXG/USDT)' },
  { value: 'EUR/USDT', label: 'EUR/USD (EUR/USDT)' },
]
