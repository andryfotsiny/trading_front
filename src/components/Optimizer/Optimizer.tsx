// src/components/Optimizer/Optimizer.tsx
import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Trophy, Search, Zap } from 'lucide-react'

export default function Optimizer() {
  const [mode, setMode] = useState<'single' | 'all' | 'timeframes'>('single')
  const [strategy, setStrategy] = useState('rsi_macd_combo')
  const [symbol, setSymbol] = useState('BTC/USDT')
  const [timeframe, setTimeframe] = useState('1h')
  const [limit, setLimit] = useState(500)
  const [capital, setCapital] = useState(1000)
  const [types, setTypes] = useState<string[]>([])
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState('win_rate')

  useEffect(() => {
    api.get('/strategies/types').then((r) => setTypes(r.data.available))
  }, [])

  const runOptimize = async () => {
    setLoading(true)
    setResults(null)
    const parts = symbol.split('/')
    try {
      let data
      if (mode === 'single') {
        const r = await api.post(`/optimizer/optimize/${strategy}/${parts[0]}/${parts[1]}?timeframe=${timeframe}&limit=${limit}&capital=${capital}`)
        data = r.data
      } else if (mode === 'all') {
        const r = await api.post(`/optimizer/optimize-all/${parts[0]}/${parts[1]}?timeframe=${timeframe}&limit=${limit}&capital=${capital}`)
        data = r.data
      } else {
        const r = await api.post(`/optimizer/optimize-timeframes/${parts[0]}/${parts[1]}?limit=${limit}&capital=${capital}`)
        data = r.data
      }
      setResults(data)
    } catch (e: any) {
      setResults({ error: e.response?.data?.detail || 'Erreur (timeout Binance?)' })
    }
    setLoading(false)
  }

  const sortResults = (list: any[]) => {
    return [...list].sort((a, b) => {
      if (sortBy === 'win_rate') return b.win_rate - a.win_rate
      if (sortBy === 'total_pnl') return b.total_pnl - a.total_pnl
      if (sortBy === 'profit_factor') return (b.profit_factor || 0) - (a.profit_factor || 0)
      if (sortBy === 'max_drawdown') return a.max_drawdown - b.max_drawdown
      return 0
    })
  }

  const allResults = results?.all_results || results?.top_20 || []
  const sorted = sortResults(allResults)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Optimiseur de strategie</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-900 p-5 rounded-xl">
          <h3 className="font-semibold mb-4">Configuration</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Mode de recherche</label>
              <div className="flex gap-1">
                <button onClick={() => setMode('single')}
                  className={`flex-1 p-2 rounded text-xs ${mode === 'single' ? 'bg-purple-600' : 'bg-gray-800'}`}>
                  1 strategie
                </button>
                <button onClick={() => setMode('all')}
                  className={`flex-1 p-2 rounded text-xs ${mode === 'all' ? 'bg-purple-600' : 'bg-gray-800'}`}>
                  Toutes
                </button>
                <button onClick={() => setMode('timeframes')}
                  className={`flex-1 p-2 rounded text-xs ${mode === 'timeframes' ? 'bg-purple-600' : 'bg-gray-800'}`}>
                  Multi-timeframe
                </button>
              </div>
            </div>
            {mode === 'single' && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Strategie</label>
                <select value={strategy} onChange={(e) => setStrategy(e.target.value)}
                  className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none">
                  {types.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Paire</label>
              <select value={symbol} onChange={(e) => setSymbol(e.target.value)}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none">
                <option>BTC/USDT</option><option>ETH/USDT</option><option>BNB/USDT</option>
              </select>
            </div>
            {mode !== 'timeframes' && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Timeframe</label>
                <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none">
                  <option value="5m">5 minutes</option>
                  <option value="15m">15 minutes</option>
                  <option value="1h">1 heure</option>
                  <option value="4h">4 heures</option>
                </select>
              </div>
            )}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Nombre de bougies</label>
              <input type="number" value={limit} onChange={(e) => setLimit(+e.target.value)}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Capital (USDT)</label>
              <input type="number" value={capital} onChange={(e) => setCapital(+e.target.value)}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none" />
            </div>
            <p className="text-xs text-gray-600">
              {mode === 'single' ? 'Teste ~30 combinaisons SL/TP pour 1 strategie' :
               mode === 'all' ? 'Teste ~30 combos × 7 strategies = ~210 backtests' :
               'Teste 7 strategies × 4 timeframes × ~30 combos = ~840 backtests'}
            </p>
            <button onClick={runOptimize} disabled={loading}
              className="w-full p-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <><Search size={18} className="animate-spin" /> Recherche en cours...</>
              ) : (
                <><Zap size={18} /> Lancer l'optimisation</>
              )}
            </button>
          </div>
        </div>

        {results?.best && (
          <div className="lg:col-span-2 bg-gray-900 p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={20} className="text-yellow-400" />
              <h3 className="font-semibold">Meilleur resultat</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-400">Strategie</p>
                <p className="font-bold text-purple-400">{results.best.strategy}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-400">Win Rate</p>
                <p className="font-bold text-green-400">{(results.best.win_rate * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-400">PnL</p>
                <p className={`font-bold ${results.best.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{results.best.total_pnl} USDT</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-400">Trades (TP/SL)</p>
                <p className="font-bold"><span className="text-green-400">{results.best.winning_trades}</span> / <span className="text-red-400">{results.best.losing_trades}</span></p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-400">Stop-Loss</p>
                <p className="font-bold">{(results.best.sl_pct * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-400">Take-Profit</p>
                <p className="font-bold">{(results.best.tp_pct * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-400">Timeframe</p>
                <p className="font-bold">{results.best.timeframe || timeframe}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-400">Max Drawdown</p>
                <p className="font-bold">{(results.best.max_drawdown * 100).toFixed(2)}%</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">{results.combinations_tested} combinaisons testees sur {results.candles || '?'} bougies</p>
          </div>
        )}
      </div>

      {sorted.length > 0 && (
        <div className="bg-gray-900 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Classement ({sorted.length} resultats)</h3>
            <div className="flex gap-1">
              <label className="text-xs text-gray-400 mt-2 mr-2">Trier par:</label>
              {[
                { key: 'win_rate', label: 'Win Rate' },
                { key: 'total_pnl', label: 'PnL' },
                { key: 'profit_factor', label: 'Profit Factor' },
                { key: 'max_drawdown', label: 'Drawdown' },
              ].map((s) => (
                <button key={s.key} onClick={() => setSortBy(s.key)}
                  className={`px-3 py-1 rounded text-xs ${sortBy === s.key ? 'bg-purple-600' : 'bg-gray-800'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-900"><tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left py-2 px-2">#</th>
                <th className="text-left px-2">Strategie</th>
                {mode === 'timeframes' && <th className="px-2">TF</th>}
                <th className="px-2">SL</th>
                <th className="px-2">TP</th>
                <th className="px-2">Trades</th>
                <th className="px-2">TP/SL</th>
                <th className="px-2">Win Rate</th>
                <th className="px-2">PnL</th>
                <th className="px-2">Capital fin</th>
                <th className="px-2">Drawdown</th>
                <th className="px-2">Profit F.</th>
              </tr></thead>
              <tbody>
                {sorted.map((r: any, i: number) => (
                  <tr key={i} className={`border-b border-gray-800 ${i === 0 ? 'bg-yellow-900/20' : ''}`}>
                    <td className="py-2 px-2">{i === 0 ? '🏆' : i + 1}</td>
                    <td className="px-2 text-purple-400">{r.strategy}</td>
                    {mode === 'timeframes' && <td className="px-2">{r.timeframe}</td>}
                    <td className="px-2">{(r.sl_pct * 100).toFixed(1)}%</td>
                    <td className="px-2">{(r.tp_pct * 100).toFixed(1)}%</td>
                    <td className="px-2 text-center">{r.total_trades}</td>
                    <td className="px-2 text-center"><span className="text-green-400">{r.winning_trades}</span>/<span className="text-red-400">{r.losing_trades}</span></td>
                    <td className="px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${r.win_rate >= 0.5 ? 'bg-green-900 text-green-400' : r.win_rate >= 0.4 ? 'bg-yellow-900 text-yellow-400' : 'bg-red-900 text-red-400'}`}>
                        {(r.win_rate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className={`px-2 text-center ${r.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{r.total_pnl}</td>
                    <td className={`px-2 text-center ${r.final_capital >= capital ? 'text-green-400' : 'text-red-400'}`}>{r.final_capital}</td>
                    <td className="px-2 text-center">{(r.max_drawdown * 100).toFixed(1)}%</td>
                    <td className={`px-2 text-center ${(r.profit_factor || 0) >= 1 ? 'text-green-400' : 'text-red-400'}`}>{r.profit_factor || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {results?.error && (
        <div className="bg-red-900/20 border border-red-800 p-4 rounded-xl mt-4">
          <p className="text-red-400">{results.error}</p>
        </div>
      )}
    </div>
  )
}
