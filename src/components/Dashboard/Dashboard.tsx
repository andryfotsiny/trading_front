import { useToastStore } from '../../store/toastStore'
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Trophy } from 'lucide-react'
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

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-gray-900 p-5 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        <Icon size={18} className={color} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Prix BTC/USDT" value={price ? `$${price.toLocaleString()}` : '...'} icon={DollarSign} color="text-blue-400" />
        <StatCard label="RSI" value={indicators?.rsi ?? '...'} icon={BarChart3} color={indicators && indicators.rsi > 70 ? 'text-red-400' : indicators && indicators.rsi < 30 ? 'text-green-400' : 'text-gray-400'} />
        <StatCard label="PnL Total" value={stats ? `${stats.total_pnl} USDT` : '...'} icon={stats?.total_pnl >= 0 ? TrendingUp : TrendingDown} color={stats?.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'} />
        <StatCard label="Win Rate" value={stats ? `${(stats.win_rate * 100).toFixed(1)}%` : '...'} icon={Trophy} color="text-yellow-400" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-400">Trades ouverts</p>
          <p className="text-lg font-bold text-yellow-400">{stats?.open_trades ?? 0}</p>
        </div>
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-400">Trades fermes</p>
          <p className="text-lg font-bold">{stats?.closed_trades ?? 0}</p>
        </div>
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-400">TP (gains)</p>
          <p className="text-lg font-bold text-green-400">{stats?.tp_count ?? 0}</p>
        </div>
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-400">SL (pertes)</p>
          <p className="text-lg font-bold text-red-400">{stats?.sl_count ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {indicators && (
          <div className="bg-gray-900 p-5 rounded-xl">
            <h3 className="font-semibold mb-3">Indicateurs BTC/USDT</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">MACD</span><span>{indicators.macd.macd.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Signal</span><span>{indicators.macd.signal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">SMA 20</span><span>${indicators.sma_20.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">EMA 20</span><span>${indicators.ema_20.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Bollinger Upper</span><span>${indicators.bollinger.upper.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Bollinger Lower</span><span>${indicators.bollinger.lower.toLocaleString()}</span></div>
            </div>
          </div>
        )}
        {balance && (
          <div className="bg-gray-900 p-5 rounded-xl">
            <h3 className="font-semibold mb-3">Solde Binance</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(balance.free || {}).filter(([_, v]: any) => v > 0).slice(0, 8).map(([k, v]: any) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-400">{k}</span>
                  <span>{typeof v === 'number' ? v.toFixed(6) : v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {stratStats.length > 0 && (
        <div className="bg-gray-900 p-5 rounded-xl mb-6">
          <h3 className="font-semibold mb-3">Classement des strategies</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-gray-400 border-b border-gray-800">
              <th className="text-left py-2">#</th><th className="text-left">Strategie</th><th>Trades</th><th>TP</th><th>SL</th><th>Win Rate</th><th>PnL</th><th>PnL moyen</th>
            </tr></thead>
            <tbody>
              {stratStats.map((s: any, i: number) => (
                <tr key={s.strategy} className="border-b border-gray-800">
                  <td className="py-2">{i + 1}</td>
                  <td className="font-medium">{s.strategy}</td>
                  <td className="text-center">{s.total_trades}</td>
                  <td className="text-center text-green-400">{s.wins}</td>
                  <td className="text-center text-red-400">{s.losses}</td>
                  <td className="text-center">
                    <span className={`px-2 py-1 rounded text-xs ${s.win_rate >= 0.5 ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                      {(s.win_rate * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className={`text-center ${s.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{s.total_pnl} USDT</td>
                  <td className={`text-center ${s.avg_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{s.avg_pnl} USDT</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {trades.length > 0 && (
        <div className="bg-gray-900 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Trades ouverts ({trades.length})</h3>
            <button onClick={handleCheckExits} disabled={checkExits.isPending}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm disabled:opacity-50">
              {checkExits.isPending ? 'Verification...' : 'Verifier SL/TP'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left py-2">Paire</th><th>Side</th><th>Strategie</th><th>Entree</th><th>Prix actuel</th><th>SL</th><th>TP</th><th>Quantite</th><th>Action</th>
              </tr></thead>
              <tbody>
                {trades.map((t: any) => (
                  <tr key={t.id} className="border-b border-gray-800">
                    <td className="py-2">{t.symbol}</td>
                    <td className={t.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>{t.side}</td>
                    <td className="text-purple-400">{t.strategy_name || '-'}</td>
                    <td>${t.entry_price}</td>
                    <td className="text-blue-400">${price || '...'}</td>
                    <td className="text-red-400">${t.stop_loss}</td>
                    <td className="text-green-400">${t.take_profit}</td>
                    <td>{t.quantity}</td>
                    <td>
                      <button onClick={() => handleClose(t.id)} disabled={closeTrade.isPending}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs disabled:opacity-50">
                        {closeTrade.isPending ? '...' : 'Fermer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
