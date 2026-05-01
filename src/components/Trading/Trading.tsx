// src/components/Trading/Trading.tsx
import { useState } from 'react'
import api from '../../services/api'

export default function Trading() {
  const [symbol, setSymbol] = useState('BTC/USDT')
  const [side, setSide] = useState('BUY')
  const [capital, setCapital] = useState(1000)
  const [mode, setMode] = useState<'paper' | 'real'>('paper')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const openTrade = async () => {
    setLoading(true)
    setResult(null)
    try {
      if (mode === 'paper') {
        const { data } = await api.post(`/trading/open?symbol=${symbol}&side=${side}&capital=${capital}`)
        setResult(data)
      } else {
        const endpoint = side === 'BUY' ? '/trading/real/buy' : '/trading/real/sell'
        const { data } = await api.post(`${endpoint}?symbol=${symbol}&capital=${capital}`)
        setResult(data)
      }
    } catch (e: any) {
      setResult({ error: e.response?.data?.detail || 'Erreur (timeout Binance?)' })
    }
    setLoading(false)
  }

  const checkExits = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/trading/check-exits')
      setResult(data)
    } catch (e: any) {
      setResult({ error: e.response?.data?.detail || 'Erreur' })
    }
    setLoading(false)
  }

  const testAll = async () => {
    setLoading(true)
    const parts = symbol.split('/')
    try {
      const { data } = await api.post(`/strategies/test-all/${parts[0]}/${parts[1]}`)
      setResult(data)
    } catch (e: any) {
      setResult({ error: e.response?.data?.detail || 'Erreur' })
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Trading</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-5 rounded-xl">
          <h3 className="font-semibold mb-4">Ouvrir un trade</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button onClick={() => setMode('paper')}
                className={`flex-1 p-3 rounded-lg font-medium text-sm ${mode === 'paper' ? 'bg-gray-700 ring-2 ring-blue-500' : 'bg-gray-800'}`}>
                Paper (simulation)
              </button>
              <button onClick={() => setMode('real')}
                className={`flex-1 p-3 rounded-lg font-medium text-sm ${mode === 'real' ? 'bg-orange-700 ring-2 ring-orange-400' : 'bg-gray-800'}`}>
                Reel (Binance)
              </button>
            </div>
            {mode === 'real' && (
              <p className="text-xs text-orange-400 px-1">Attention: ceci envoie un vrai ordre sur Binance</p>
            )}
            <select value={symbol} onChange={(e) => setSymbol(e.target.value)}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none">
              <option>BTC/USDT</option><option>ETH/USDT</option><option>BNB/USDT</option>
            </select>
            <div className="flex gap-2">
              <button onClick={() => setSide('BUY')}
                className={`flex-1 p-3 rounded-lg font-medium ${side === 'BUY' ? 'bg-green-600' : 'bg-gray-800'}`}>
                BUY
              </button>
              <button onClick={() => setSide('SELL')}
                className={`flex-1 p-3 rounded-lg font-medium ${side === 'SELL' ? 'bg-red-600' : 'bg-gray-800'}`}>
                SELL
              </button>
            </div>
            <input type="number" value={capital} onChange={(e) => setCapital(+e.target.value)}
              placeholder="Capital USDT" className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none" />
            <button onClick={openTrade} disabled={loading}
              className={`w-full p-3 rounded-lg font-medium disabled:opacity-50 ${mode === 'real' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {loading ? 'Chargement...' : mode === 'real' ? `${side} REEL sur Binance` : `${side} Paper (simulation)`}
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={checkExits} disabled={loading} className="flex-1 p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm disabled:opacity-50">
              Verifier SL/TP
            </button>
            <button onClick={testAll} disabled={loading} className="flex-1 p-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm disabled:opacity-50">
              Tester strategies
            </button>
          </div>
        </div>

        <div className="bg-gray-900 p-5 rounded-xl">
          <h3 className="font-semibold mb-4">Resultat</h3>
          {result ? (
            <pre className="text-sm text-gray-300 bg-gray-800 p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">Aucune action effectuee</p>
          )}
        </div>
      </div>
    </div>
  )
}
