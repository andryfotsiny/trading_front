// src/components/Trading/History.tsx
import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function History() {
  const [trades, setTrades] = useState<any[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/trading/history?limit=100').then((r) => setTrades(r.data))
  }, [])

  const filtered = filter === 'all' ? trades
    : filter === 'wins' ? trades.filter((t) => (t.pnl || 0) > 0)
    : trades.filter((t) => (t.pnl || 0) < 0)

  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const wins = trades.filter((t) => (t.pnl || 0) > 0).length
  const losses = trades.filter((t) => (t.pnl || 0) < 0).length

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Historique des trades</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-400">Total trades</p>
          <p className="text-lg font-bold">{trades.length}</p>
        </div>
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-400">TP (gains)</p>
          <p className="text-lg font-bold text-green-400">{wins}</p>
        </div>
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-400">SL (pertes)</p>
          <p className="text-lg font-bold text-red-400">{losses}</p>
        </div>
        <div className="bg-gray-900 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-400">PnL Total</p>
          <p className={`text-lg font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{totalPnl.toFixed(4)} USDT</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'wins', 'losses'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm ${filter === f ? 'bg-blue-600' : 'bg-gray-800'}`}>
            {f === 'all' ? 'Tous' : f === 'wins' ? 'Gains (TP)' : 'Pertes (SL)'}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 p-5 rounded-xl">
        {filtered.length === 0 ? (
          <p className="text-gray-500">Aucun trade</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-gray-400 border-b border-gray-800">
              <th className="text-left py-2">Paire</th><th>Side</th><th>Strategie</th><th>Entree</th><th>Sortie</th><th>PnL</th><th>PnL %</th><th>Type</th><th>Date</th>
            </tr></thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-gray-800">
                  <td className="py-2">{t.symbol}</td>
                  <td className={t.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>{t.side}</td>
                  <td className="text-purple-400">{t.strategy_name || 'manual'}</td>
                  <td>${t.entry_price}</td>
                  <td>${t.exit_price}</td>
                  <td className={t.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>{t.pnl} USDT</td>
                  <td className={t.pnl_pct >= 0 ? 'text-green-400' : 'text-red-400'}>{t.pnl_pct}%</td>
                  <td>{t.is_paper ? 'Paper' : 'Reel'}</td>
                  <td className="text-gray-400">{t.closed_at?.split('T')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
