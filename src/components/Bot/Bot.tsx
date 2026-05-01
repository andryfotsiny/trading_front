// src/components/Bot/Bot.tsx
import { useEffect, useState } from 'react'
import { useToastStore } from '../../store/toastStore'
import api from '../../services/api'
import { Play, Square, RefreshCw, Zap } from 'lucide-react'

export default function Bot() {
  const { addToast } = useToastStore()
  const [status, setStatus] = useState<any>(null)
  const [strategies, setStrategies] = useState<any[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const fetchStatus = () => {
    api.get('/bot/status').then((r) => setStatus(r.data)).catch(() => {})
    api.get('/strategies/').then((r) => setStrategies(r.data)).catch(() => {})
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const runNow = async () => {
    setLoading(true)
    addLog('Cycle manuel lance...')
    try {
      await api.post('/bot/run-now')
      addLog('Cycle termine')
      addToast('success', 'Cycle bot execute avec succes')
      fetchStatus()
    } catch {
      addLog('Erreur: timeout Binance testnet')
    }
    setLoading(false)
  }

  const activate = async (id: number, name: string) => {
    await api.post(`/strategies/${id}/activate`)
    addLog(`${name} activee`)
    addToast('success', `${name} activee`)
    fetchStatus()
  }

  const deactivate = async (id: number, name: string) => {
    await api.post(`/strategies/${id}/deactivate`)
    addLog(`${name} desactivee`)
    addToast('info', `${name} desactivee`)
    fetchStatus()
  }

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString()
    setLogs((prev) => [`[${time}] ${msg}`, ...prev].slice(0, 50))
  }

  const activeCount = strategies.filter((s) => s.is_active).length

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Bot Trading</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${status?.running ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-gray-400">Statut</span>
          </div>
          <p className="text-xl font-bold">{status?.running ? 'Actif' : 'Inactif'}</p>
          {status?.next_run && <p className="text-sm text-gray-500 mt-1">Prochain: {new Date(status.next_run).toLocaleTimeString()}</p>}
        </div>
        <div className="bg-gray-900 p-5 rounded-xl">
          <span className="text-gray-400 text-sm">Strategies actives</span>
          <p className="text-xl font-bold mt-1">{activeCount} / {strategies.length}</p>
        </div>
        <div className="bg-gray-900 p-5 rounded-xl">
          <span className="text-gray-400 text-sm">Intervalle</span>
          <p className="text-xl font-bold mt-1">{status?.interval || '5 minutes'}</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button onClick={runNow} disabled={loading}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50">
          {loading ? <RefreshCw size={18} className="animate-spin" /> : <Zap size={18} />}
          {loading ? 'En cours...' : 'Lancer un cycle maintenant'}
        </button>
        <button onClick={fetchStatus}
          className="flex items-center gap-2 px-5 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg">
          <RefreshCw size={18} /> Rafraichir
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-5 rounded-xl">
          <h3 className="font-semibold mb-4">Strategies</h3>
          {strategies.length === 0 ? (
            <p className="text-gray-500">Aucune strategie. Cree-en dans l'onglet Strategies.</p>
          ) : (
            <div className="space-y-3">
              {strategies.map((s) => (
                <div key={s.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-gray-400">{s.strategy_type} - {s.symbol} - {s.timeframe}</p>
                  </div>
                  {s.is_active ? (
                    <button onClick={() => deactivate(s.id, s.name)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm">
                      <Square size={14} /> Stop
                    </button>
                  ) : (
                    <button onClick={() => activate(s.id, s.name)}
                      className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm">
                      <Play size={14} /> Start
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 p-5 rounded-xl">
          <h3 className="font-semibold mb-4">Logs</h3>
          <div className="bg-gray-800 rounded-lg p-4 h-80 overflow-y-auto font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <p className="text-gray-500">Aucun log</p>
            ) : (
              logs.map((log, i) => <p key={i} className="text-gray-300">{log}</p>)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
