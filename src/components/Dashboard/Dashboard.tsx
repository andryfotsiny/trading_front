import { DollarSign, TrendingUp, TrendingDown, BarChart3, Trophy, Activity } from 'lucide-react'
import { useToastStore } from '../../store/toastStore'
import { StatCard, Card, Badge, Button, Table, PageHeader } from '../UI/Components'
import {
  useDashboardStats,
  useStrategyStats,
  useOpenTrades,
  useBtcPrice,
  useBalance,
  useIndicators,
  useCloseTrade,
  useCheckExits,
} from '../../hooks/useTrading'

export default function Dashboard() {
  const { addToast } = useToastStore()
  const { data: stats } = useDashboardStats()
  const { data: stratStats = [] } = useStrategyStats()
  const { data: trades = [] } = useOpenTrades()
  const { data: price } = useBtcPrice()
  const { data: balance } = useBalance()
  const { data: indicators } = useIndicators()
  const closeTrade = useCloseTrade()
  const checkExits = useCheckExits()

  const handleClose = async (id: number) => {
    const result = await closeTrade.mutateAsync(id)
    if (result.pnl !== undefined) {
      addToast(result.pnl >= 0 ? 'success' : 'info', `Trade #${id} ferme. PnL: ${result.pnl} USDT (${result.pnl_pct}%)`)
    }
  }

  const handleCheckExits = async () => {
    const result = await checkExits.mutateAsync()
    if (result.closed?.length > 0) {
      addToast('success', `${result.closed.length} trade(s) ferme(s) automatiquement`)
    } else {
      addToast('info', 'Aucun SL/TP touche.')
    }
  }

  return (
    <div>
      <PageHeader title="Dashboard" sub="Vue d'ensemble du bot de trading" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Prix BTC/USDT"
          value={price ? `$${price.toLocaleString()}` : '—'}
          icon={<DollarSign size={16} />}
          trend="neutral"
        />
        <StatCard
          label="RSI"
          value={indicators?.rsi?.toFixed(1) ?? '—'}
          icon={<BarChart3 size={16} />}
          trend={indicators?.rsi > 70 ? 'down' : indicators?.rsi < 30 ? 'up' : 'neutral'}
          sub={indicators?.rsi > 70 ? 'Suracheté' : indicators?.rsi < 30 ? 'Survendu' : 'Neutre'}
        />
        <StatCard
          label="PnL Total"
          value={stats ? `${stats.total_pnl > 0 ? '+' : ''}${stats.total_pnl} USDT` : '—'}
          icon={stats?.total_pnl >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          trend={stats?.total_pnl >= 0 ? 'up' : 'down'}
        />
        <StatCard
          label="Win Rate"
          value={stats ? `${(stats.win_rate * 100).toFixed(1)}%` : '—'}
          icon={<Trophy size={16} />}
          trend={stats?.win_rate >= 0.5 ? 'up' : 'down'}
          sub={stats ? `${stats.closed_trades} trades fermés` : undefined}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Trades ouverts', value: stats?.open_trades ?? 0, color: 'text-amber-400' },
          { label: 'Trades fermés', value: stats?.closed_trades ?? 0, color: 'text-zinc-100' },
          { label: 'TP (gains)', value: stats?.tp_count ?? 0, color: 'text-emerald-400' },
          { label: 'SL (pertes)', value: stats?.sl_count ?? 0, color: 'text-rose-400' },
        ].map((item) => (
          <Card key={item.label} className="text-center py-3">
            <p className="text-xs text-zinc-500 mb-1">{item.label}</p>
            <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {indicators && (
          <Card>
            <h3 className="font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Activity size={16} className="text-cyan-400" />
              Indicateurs BTC/USDT
            </h3>
            <div className="space-y-2.5">
              {[
                { label: 'MACD', value: indicators.macd.macd.toFixed(2) },
                { label: 'Signal', value: indicators.macd.signal.toFixed(2) },
                { label: 'SMA 20', value: `$${indicators.sma_20.toLocaleString()}` },
                { label: 'EMA 20', value: `$${indicators.ema_20.toLocaleString()}` },
                { label: 'Bollinger Upper', value: `$${indicators.bollinger.upper.toLocaleString()}` },
                { label: 'Bollinger Lower', value: `$${indicators.bollinger.lower.toLocaleString()}` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-zinc-500">{row.label}</span>
                  <span className="text-zinc-200 font-mono">{row.value}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {balance && (
          <Card>
            <h3 className="font-semibold text-zinc-100 mb-4">Solde Binance</h3>
            <div className="space-y-2.5">
              {Object.entries(balance.free || {})
                .filter(([_, v]: any) => v > 0)
                .slice(0, 8)
                .map(([k, v]: any) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-zinc-500">{k}</span>
                    <span className="text-zinc-200 font-mono">{typeof v === 'number' ? v.toFixed(6) : v}</span>
                  </div>
                ))}
            </div>
          </Card>
        )}
      </div>

      {stratStats.length > 0 && (
        <Card className="mb-6">
          <h3 className="font-semibold text-zinc-100 mb-4">Classement des strategies</h3>
          <Table headers={['#', 'Strategie', 'Trades', 'TP', 'SL', 'Win Rate', 'PnL', 'PnL moy.']}>
            {stratStats.map((s: any, i: number) => (
              <tr key={s.strategy}>
                <td className="py-3 px-2 text-zinc-500 text-sm">{i + 1}</td>
                <td className="py-3 px-2 text-zinc-100 font-medium text-sm">{s.strategy}</td>
                <td className="py-3 px-2 text-center text-zinc-300 text-sm">{s.total_trades}</td>
                <td className="py-3 px-2 text-center text-emerald-400 text-sm">{s.wins}</td>
                <td className="py-3 px-2 text-center text-rose-400 text-sm">{s.losses}</td>
                <td className="py-3 px-2 text-center">
                  <Badge variant={s.win_rate >= 0.5 ? 'success' : 'danger'}>
                    {(s.win_rate * 100).toFixed(1)}%
                  </Badge>
                </td>
                <td className={`py-3 px-2 text-center text-sm font-mono ${s.total_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {s.total_pnl > 0 ? '+' : ''}{s.total_pnl}
                </td>
                <td className={`py-3 px-2 text-center text-sm font-mono ${s.avg_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {s.avg_pnl > 0 ? '+' : ''}{s.avg_pnl}
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {trades.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-100">
              Trades ouverts
              <span className="ml-2 text-sm font-normal text-zinc-500">({trades.length})</span>
            </h3>
            <Button onClick={handleCheckExits} disabled={checkExits.isPending} variant="warning" size="sm">
              {checkExits.isPending ? 'Verification...' : 'Verifier SL/TP'}
            </Button>
          </div>
          <Table headers={['Paire', 'Side', 'Strategie', 'Entree', 'Actuel', 'SL', 'TP', 'Qté', 'Action']}>
            {trades.map((t: any) => (
              <tr key={t.id}>
                <td className="py-3 px-2 text-zinc-100 text-sm font-medium">{t.symbol}</td>
                <td className="py-3 px-2 text-center">
                  <Badge variant={t.side === 'BUY' ? 'success' : 'danger'}>{t.side}</Badge>
                </td>
                <td className="py-3 px-2 text-center text-cyan-400 text-sm">{t.strategy_name || '—'}</td>
                <td className="py-3 px-2 text-center text-zinc-300 text-sm font-mono">${t.entry_price}</td>
                <td className="py-3 px-2 text-center text-cyan-300 text-sm font-mono">${price || '—'}</td>
                <td className="py-3 px-2 text-center text-rose-400 text-sm font-mono">${t.stop_loss}</td>
                <td className="py-3 px-2 text-center text-emerald-400 text-sm font-mono">${t.take_profit}</td>
                <td className="py-3 px-2 text-center text-zinc-400 text-xs">{t.quantity}</td>
                <td className="py-3 px-2 text-center">
                  <Button onClick={() => handleClose(t.id)} disabled={closeTrade.isPending} variant="danger" size="sm">
                    {closeTrade.isPending ? '...' : 'Fermer'}
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
    </div>
  )
}
