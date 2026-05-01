// src/components/Backtest/Backtest.tsx
import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function Backtest() {
  const [strategy, setStrategy] = useState('rsi_macd_combo')
  const [symbol, setSymbol] = useState('BTC/USDT')
  const [timeframe, setTimeframe] = useState('1h')
  const [limit, setLimit] = useState(500)
  const [capital, setCapital] = useState(1000)
  const [slPct, setSlPct] = useState(0.02)
  const [tpPct, setTpPct] = useState(0.04)
  const [riskPct, setRiskPct] = useState(0.02)
  const [result, setResult] = useState<any>(null)
  const [detail, setDetail] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [types, setTypes] = useState<string[]>([])

  useEffect(() => {
    api.get('/strategies/types').then((r) => setTypes(r.data.available))
    api.get('/backtest/').then((r) => setHistory(r.data))
  }, [])

  const runBacktest = async () => {
    setLoading(true)
    setResult(null)
    setDetail(null)
    const parts = symbol.split('/')
    try {
      const { data } = await api.post(
        `/backtest/run/${strategy}/${parts[0]}/${parts[1]}?timeframe=${timeframe}&limit=${limit}&capital=${capital}&risk_pct=${riskPct}&sl_pct=${slPct}&tp_pct=${tpPct}`
      )
      setResult(data)
      api.get('/backtest/').then((r) => setHistory(r.data))
    } catch (e: any) {
      setResult({ error: e.response?.data?.detail || 'Erreur (timeout Binance?)' })
    }
    setLoading(false)
  }

  const viewDetail = async (id: number) => {
    try {
      const { data } = await api.get(`/backtest/${id}`)
      setDetail(data)
    } catch {}
  }

  const deleteBacktest = async (id: number) => {
    await api.delete(`/backtest/${id}`)
    api.get('/backtest/').then((r) => setHistory(r.data))
    if (detail?.id === id) setDetail(null)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Backtest</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-5 rounded-xl">
          <h3 className="font-semibold mb-4">Lancer un backtest</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Strategie</label>
              <select value={strategy} onChange={(e) => setStrategy(e.target.value)}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none">
                {types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Paire</label>
              <select value={symbol} onChange={(e) => setSymbol(e.target.value)}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none">
                <option>BTC/USDT</option><option>ETH/USDT</option><option>BNB/USDT</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Timeframe</label>
              <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none">
                <option value="1m">1 minute</option>
                <option value="5m">5 minutes</option>
                <option value="15m">15 minutes</option>
                <option value="1h">1 heure</option>
                <option value="4h">4 heures</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Nombre de bougies (plus = plus de donnees historiques)</label>
              <input type="number" value={limit} onChange={(e) => setLimit(+e.target.value)}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Capital de depart (USDT)</label>
              <input type="number" value={capital} onChange={(e) => setCapital(+e.target.value)}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Risque %</label>
                <input type="number" step="0.01" value={riskPct} onChange={(e) => setRiskPct(+e.target.value)}
                  className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Stop-Loss %</label>
                <input type="number" step="0.01" value={slPct} onChange={(e) => setSlPct(+e.target.value)}
                  className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Take-Profit %</label>
                <input type="number" step="0.01" value={tpPct} onChange={(e) => setTpPct(+e.target.value)}
                  className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none text-sm" />
              </div>
            </div>
            <p className="text-xs text-gray-600">SL {(slPct*100).toFixed(0)}% = ferme si perd {(slPct*100).toFixed(0)}% | TP {(tpPct*100).toFixed(0)}% = ferme si gagne {(tpPct*100).toFixed(0)}%</p>
            <button onClick={runBacktest} disabled={loading}
              className="w-full p-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium disabled:opacity-50">
              {loading ? 'En cours...' : 'Lancer le backtest'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gray-900 p-5 rounded-xl">
          <h3 className="font-semibold mb-4">Resultat</h3>
          {result ? (
            result.error ? <p className="text-red-400">{result.error}</p> : (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">PnL</p>
                    <p className={`font-bold ${result.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{result.total_pnl} USDT</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Win rate</p>
                    <p className={`font-bold ${result.win_rate >= 0.5 ? 'text-green-400' : 'text-red-400'}`}>{(result.win_rate * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Trades (TP/SL)</p>
                    <p className="font-bold"><span className="text-green-400">{result.winning_trades}</span> / <span className="text-red-400">{result.losing_trades}</span></p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Max Drawdown</p>
                    <p className="font-bold">{(result.max_drawdown * 100).toFixed(2)}%</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Capital final</p>
                    <p className={`font-bold ${result.final_capital >= capital ? 'text-green-400' : 'text-red-400'}`}>{result.final_capital} USDT</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Sharpe Ratio</p>
                    <p className="font-bold">{result.sharpe_ratio ?? '-'}</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Profit Factor</p>
                    <p className={`font-bold ${result.profit_factor >= 1 ? 'text-green-400' : 'text-red-400'}`}>{result.profit_factor ?? '-'}</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Gain moy / Perte moy</p>
                    <p className="font-bold text-sm"><span className="text-green-400">{result.avg_win}</span> / <span className="text-red-400">{result.avg_loss}</span></p>
                  </div>
                </div>
                {result.trades_detail && result.trades_detail.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-400 mb-2">Detail des {result.trades_detail.length} trades</p>
                    <div className="max-h-60 overflow-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="text-gray-500 border-b border-gray-700">
                          <th className="text-left py-1">#</th><th>Side</th><th>Entree</th><th>Sortie</th><th>PnL</th><th>Raison</th>
                        </tr></thead>
                        <tbody>
                          {result.trades_detail.map((t: any, i: number) => (
                            <tr key={i} className="border-b border-gray-800">
                              <td className="py-1 text-gray-500">{i+1}</td>
                              <td className={t.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>{t.side}</td>
                              <td>${t.entry_price}</td>
                              <td>${t.exit_price}</td>
                              <td className={t.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>{t.pnl}</td>
                              <td className={t.reason === 'take_profit' ? 'text-green-400' : t.reason === 'stop_loss' ? 'text-red-400' : 'text-gray-400'}>{t.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )
          ) : <p className="text-gray-500">Lance un backtest pour voir les resultats</p>}
        </div>
      </div>

      {history.length > 0 && (
        <div className="bg-gray-900 p-5 rounded-xl mt-6">
          <h3 className="font-semibold mb-3">Historique backtests</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-gray-400 border-b border-gray-800">
              <th className="text-left py-2">Strategie</th><th>Paire</th><th>Trades</th><th>Win rate</th><th>PnL</th><th>Drawdown</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {history.map((b) => (
                <tr key={b.id} className="border-b border-gray-800">
                  <td className="py-2">{b.strategy_type}</td>
                  <td>{b.symbol}</td>
                  <td>{b.total_trades}</td>
                  <td className={b.win_rate >= 0.5 ? 'text-green-400' : 'text-red-400'}>{(b.win_rate * 100).toFixed(1)}%</td>
                  <td className={b.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}>{b.total_pnl} USDT</td>
                  <td>{(b.max_drawdown * 100).toFixed(2)}%</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => viewDetail(b.id)} className="px-2 py-1 bg-blue-600 rounded text-xs">Detail</button>
                      <button onClick={() => deleteBacktest(b.id)} className="px-2 py-1 bg-red-600 rounded text-xs">X</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="bg-gray-900 p-5 rounded-xl mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Detail backtest #{detail.id} - {detail.strategy_type}</h3>
            <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-white">Fermer</button>
          </div>
          {detail.trades_detail && (
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-gray-500 border-b border-gray-700">
                  <th className="text-left py-1">#</th><th>Side</th><th>Entree</th><th>Sortie</th><th>Quantite</th><th>PnL</th><th>PnL %</th><th>Raison</th>
                </tr></thead>
                <tbody>
                  {detail.trades_detail.map((t: any, i: number) => (
                    <tr key={i} className="border-b border-gray-800">
                      <td className="py-1 text-gray-500">{i+1}</td>
                      <td className={t.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>{t.side}</td>
                      <td>${t.entry_price}</td>
                      <td>${t.exit_price}</td>
                      <td>{t.quantity}</td>
                      <td className={t.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>{t.pnl}</td>
                      <td className={t.pnl_pct >= 0 ? 'text-green-400' : 'text-red-400'}>{t.pnl_pct}%</td>
                      <td className={t.reason === 'take_profit' ? 'text-green-400' : t.reason === 'stop_loss' ? 'text-red-400' : 'text-gray-400'}>{t.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
