import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Card, Badge, Button, Table, PageHeader } from '../UI/Components'
import { SkeletonTable } from '../UI/Skeleton'
import { Trash2 } from 'lucide-react'

const inputCls = 'w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 outline-none focus:border-cyan-500/50 transition-colors'
const labelCls = 'text-xs text-zinc-500 mb-1 block'

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
      <PageHeader title="Backtest" sub="Testez vos stratégies sur données historiques" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <h3 className="font-semibold text-zinc-100 mb-4">Lancer un backtest</h3>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Strategie</label>
              <select value={strategy} onChange={(e) => setStrategy(e.target.value)} className={inputCls}>
                {types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Paire</label>
              <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className={inputCls}>
                <option>BTC/USDT</option><option>ETH/USDT</option><option>BNB/USDT</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Timeframe</label>
              <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className={inputCls}>
                {['1m','5m','15m','1h','4h'].map((t) => <option key={t} value={t}>{t === '1h' ? '1 heure' : t === '4h' ? '4 heures' : t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Nombre de bougies</label>
              <input type="number" value={limit} onChange={(e) => setLimit(+e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Capital de depart (USDT)</label>
              <input type="number" value={capital} onChange={(e) => setCapital(+e.target.value)} className={inputCls} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={labelCls}>Risque %</label>
                <input type="number" step="0.01" value={riskPct} onChange={(e) => setRiskPct(+e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Stop-Loss %</label>
                <input type="number" step="0.01" value={slPct} onChange={(e) => setSlPct(+e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Take-Profit %</label>
                <input type="number" step="0.01" value={tpPct} onChange={(e) => setTpPct(+e.target.value)} className={inputCls} />
              </div>
            </div>
            <p className="text-xs text-zinc-600">SL {(slPct*100).toFixed(0)}% = ferme si perd {(slPct*100).toFixed(0)}% | TP {(tpPct*100).toFixed(0)}% = ferme si gagne {(tpPct*100).toFixed(0)}%</p>
            <Button onClick={runBacktest} disabled={loading} className="w-full">
              {loading ? 'Calcul en cours...' : 'Lancer le backtest'}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <h3 className="font-semibold text-zinc-100 mb-4">Resultat</h3>
            {!result ? (
              <p className="text-zinc-600 text-sm">Lance un backtest pour voir les resultats</p>
            ) : result.error ? (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg p-4">{result.error}</div>
            ) : (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Capital final', value: `${result.final_capital} USDT`, positive: result.final_capital >= capital },
                    { label: 'PnL', value: `${result.total_pnl > 0 ? '+' : ''}${result.total_pnl} USDT`, positive: result.total_pnl >= 0 },
                    { label: 'Win Rate', value: `${(result.win_rate * 100).toFixed(1)}%`, positive: result.win_rate >= 0.5 },
                    { label: 'Trades', value: result.total_trades, positive: true },
                    { label: 'Max Drawdown', value: `${(result.max_drawdown * 100).toFixed(2)}%`, positive: result.max_drawdown < 0.1 },
                    { label: 'Profit Factor', value: result.profit_factor ?? '-', positive: (result.profit_factor || 0) >= 1 },
                    { label: 'Gain moy', value: result.avg_win, positive: true },
                    { label: 'Perte moy', value: result.avg_loss, positive: false },
                  ].map((item) => (
                    <div key={item.label} className="bg-zinc-800 rounded-lg p-3">
                      <p className="text-xs text-zinc-500 mb-1">{item.label}</p>
                      <p className={`font-bold text-sm ${item.positive ? 'text-emerald-400' : 'text-rose-400'}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
                {result.trades_detail?.length > 0 && (
                  <div className="max-h-60 overflow-auto">
                    <Table headers={['#', 'Side', 'Entree', 'Sortie', 'PnL', 'Raison']}>
                      {result.trades_detail.map((t: any, i: number) => (
                        <tr key={i}>
                          <td className="py-2 px-2 text-zinc-500 text-xs">{i+1}</td>
                          <td className="py-2 px-2 text-center"><Badge variant={t.side === 'BUY' ? 'success' : 'danger'}>{t.side}</Badge></td>
                          <td className="py-2 px-2 text-center text-zinc-300 text-xs font-mono">${t.entry_price}</td>
                          <td className="py-2 px-2 text-center text-zinc-300 text-xs font-mono">${t.exit_price}</td>
                          <td className={`py-2 px-2 text-center text-xs font-mono ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{t.pnl}</td>
                          <td className="py-2 px-2 text-center"><Badge variant={t.reason === 'take_profit' ? 'success' : t.reason === 'stop_loss' ? 'danger' : 'neutral'}>{t.reason}</Badge></td>
                        </tr>
                      ))}
                    </Table>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {history.length > 0 && (
        <Card>
          <h3 className="font-semibold text-zinc-100 mb-4">Historique backtests</h3>
          <Table headers={['Strategie', 'Paire', 'Trades', 'Win rate', 'PnL', 'Drawdown', 'Actions']}>
            {history.map((b: any) => (
              <tr key={b.id}>
                <td className="py-3 px-2 text-zinc-100 text-sm font-medium">{b.strategy_type}</td>
                <td className="py-3 px-2 text-center text-zinc-300 text-sm">{b.symbol}</td>
                <td className="py-3 px-2 text-center text-zinc-300 text-sm">{b.total_trades}</td>
                <td className="py-3 px-2 text-center"><Badge variant={b.win_rate >= 0.5 ? 'success' : 'danger'}>{(b.win_rate * 100).toFixed(1)}%</Badge></td>
                <td className={`py-3 px-2 text-center text-sm font-mono ${b.total_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{b.total_pnl > 0 ? '+' : ''}{b.total_pnl} USDT</td>
                <td className="py-3 px-2 text-center text-zinc-400 text-sm">{(b.max_drawdown * 100).toFixed(2)}%</td>
                <td className="py-3 px-2 text-center">
                  <div className="flex gap-1 justify-center">
                    <Button onClick={() => viewDetail(b.id)} variant="ghost" size="sm">Detail</Button>
                    <button onClick={() => deleteBacktest(b.id)} className="p-1.5 text-zinc-600 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {detail && (
        <Card className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-100">Detail backtest #{detail.id} — {detail.strategy_type}</h3>
            <button onClick={() => setDetail(null)} className="text-zinc-500 hover:text-zinc-300 text-sm">Fermer</button>
          </div>
          {detail.trades_detail && (
            <div className="max-h-80 overflow-auto">
              <Table headers={['#', 'Side', 'Entree', 'Sortie', 'Qté', 'PnL', 'PnL %', 'Raison']}>
                {detail.trades_detail.map((t: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2 px-2 text-zinc-500 text-xs">{i+1}</td>
                    <td className="py-2 px-2 text-center"><Badge variant={t.side === 'BUY' ? 'success' : 'danger'}>{t.side}</Badge></td>
                    <td className="py-2 px-2 text-center text-zinc-300 text-xs font-mono">${t.entry_price}</td>
                    <td className="py-2 px-2 text-center text-zinc-300 text-xs font-mono">${t.exit_price}</td>
                    <td className="py-2 px-2 text-center text-zinc-400 text-xs">{t.quantity}</td>
                    <td className={`py-2 px-2 text-center text-xs font-mono ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{t.pnl}</td>
                    <td className={`py-2 px-2 text-center text-xs ${t.pnl_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{t.pnl_pct}%</td>
                    <td className="py-2 px-2 text-center"><Badge variant={t.reason === 'take_profit' ? 'success' : t.reason === 'stop_loss' ? 'danger' : 'neutral'}>{t.reason}</Badge></td>
                  </tr>
                ))}
              </Table>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
