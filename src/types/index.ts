// src/types/index.ts
export interface User {
  id: number
  email: string
  username: string
  is_active: boolean
  created_at: string
}

export interface Token {
  access_token: string
  token_type: string
}

export interface Trade {
  id: number
  symbol: string
  side: string
  entry_price: number
  exit_price: number | null
  quantity: number
  stop_loss: number | null
  take_profit: number | null
  pnl: number | null
  pnl_pct: number | null
  status: string
  strategy_name: string | null
  is_paper: boolean
  opened_at: string
  closed_at: string | null
}

export interface Signal {
  action: string
  price: number
  confidence: number
  indicators: Record<string, any>
}

export interface Strategy {
  id: number
  name: string
  strategy_type: string
  symbol: string
  timeframe: string
  parameters: Record<string, any>
  risk_per_trade: number
  stop_loss_pct: number
  take_profit_pct: number
  max_open_trades: number
  is_active: boolean
  created_at: string
}

export interface BacktestResult {
  id: number
  strategy_type: string
  symbol: string
  timeframe: string
  initial_capital: number
  final_capital: number
  total_trades: number
  winning_trades: number
  losing_trades: number
  win_rate: number
  total_pnl: number
  max_drawdown: number
  sharpe_ratio: number | null
  created_at: string
}

export interface Indicators {
  symbol: string
  price: number
  rsi: number
  macd: { macd: number; signal: number; histogram: number }
  sma_20: number
  ema_20: number
  bollinger: { upper: number; middle: number; lower: number }
  volume: { current_volume: number; avg_volume: number; ratio: number; above_average: boolean }
}
