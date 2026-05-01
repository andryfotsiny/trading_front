// src/components/Strategies/Strategies.tsx
import { useEffect, useState } from 'react'
import { useStore } from '../../store'
import api from '../../services/api'

const STRATEGY_DESCRIPTIONS: Record<string, string> = {
  rsi_oversold: "BUY quand RSI sort de zone survendue, SELL quand sort de zone surachetee",
  macd_crossover: "BUY quand MACD croise signal vers le haut, SELL inverse",
  sma_crossover: "BUY quand SMA rapide croise SMA lente vers le haut, SELL inverse",
  bollinger_bounce: "BUY au rebond bande basse, SELL au rebond bande haute",
  grid_trading: "BUY/SELL automatique sur une grille de prix dans un range",
  dca_bot: "BUY quand le prix baisse sous la SMA (accumulation progressive)",
  rsi_macd_combo: "BUY/SELL quand RSI + MACD + Bollinger confirment ensemble",
}

export default function Strategies() {
  const { strategies, fetchStrategies } = useStore()
  const [types, setTypes] = useState<string[]>([])
  const [form, setForm] = useState({ name: '', strategy_type: '', symbol: 'BTC/USDT', timeframe: '5m' })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchStrategies()
    api.get('/strategies/types').then((r) => setTypes(r.data.available))
  }, [])

  const create = async () => {
    try {
      await api.post('/strategies/', form)
      setMsg('Strategie creee')
      setForm({ ...form, name: '', strategy_type: '' })
      fetchStrategies()
    } catch { setMsg('Erreur') }
  }

  const toggle = async (id: number, active: boolean) => {
    await api.post(`/strategies/${id}/${active ? 'deactivate' : 'activate'}`)
    fetchStrategies()
  }

  const run = async (id: number) => {
    setMsg('Analyse en cours...')
    try {
      const { data } = await api.post(`/strategies/${id}/run`)
      if (data.result && data.result !== 'Aucun signal') {
        setMsg(`Signal ${data.result.action} a $${data.result.price} (confiance: ${(data.result.confidence * 100).toFixed(0)}%)`)
      } else {
        setMsg('Aucun signal detecte')
      }
    } catch {
      setMsg('Erreur (timeout Binance)')
    }
  }

  const remove = async (id: number) => {
    await api.delete(`/strategies/${id}`)
    fetchStrategies()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Strategies</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-5 rounded-xl">
          <h3 className="font-semibold mb-4">Nouvelle strategie</h3>
          <div className="space-y-3">
            <input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none" />
            <select value={form.strategy_type} onChange={(e) => setForm({ ...form, strategy_type: e.target.value })}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none">
              <option value="">Choisir un type</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {form.strategy_type && (
              <p className="text-xs text-gray-500 px-1">{STRATEGY_DESCRIPTIONS[form.strategy_type] || ''}</p>
            )}
            <select value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none">
              <option>BTC/USDT</option><option>ETH/USDT</option><option>BNB/USDT</option>
            </select>
            <select value={form.timeframe} onChange={(e) => setForm({ ...form, timeframe: e.target.value })}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none">
              <option value="1m">1 minute</option>
              <option value="5m">5 minutes</option>
              <option value="15m">15 minutes</option>
              <option value="1h">1 heure</option>
              <option value="4h">4 heures</option>
              <option value="1d">1 jour</option>
            </select>
            <button onClick={create} disabled={!form.name || !form.strategy_type}
              className="w-full p-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium disabled:opacity-50">
              Creer
            </button>
            {msg && <p className="text-sm text-gray-400 mt-2">{msg}</p>}
          </div>
        </div>

        <div className="lg:col-span-2 bg-gray-900 p-5 rounded-xl">
          <h3 className="font-semibold mb-4">Mes strategies ({strategies.length})</h3>
          {strategies.length === 0 ? (
            <p className="text-gray-500">Aucune strategie</p>
          ) : (
            <div className="space-y-3">
              {strategies.map((s) => (
                <div key={s.id} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-sm text-gray-400">{s.strategy_type} - {s.symbol} - {s.timeframe}</p>
                      <p className="text-xs text-gray-600 mt-1">{STRATEGY_DESCRIPTIONS[s.strategy_type] || ''}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggle(s.id, s.is_active)}
                        className={`px-3 py-1 rounded text-sm ${s.is_active ? 'bg-green-600' : 'bg-gray-700'}`}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </button>
                      <button onClick={() => run(s.id)} className="px-3 py-1 bg-blue-600 rounded text-sm">Run</button>
                      <button onClick={() => remove(s.id)} className="px-3 py-1 bg-red-600 rounded text-sm">X</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
