import { useState } from 'react'
import { useToastStore } from '../../store/toastStore'
import { Play, RefreshCw, Zap } from 'lucide-react'
import { useBotStatus, useStrategies, useRunBot, useToggleStrategy } from '../../hooks/useTrading'

export default function Bot() {
  const { addToast } = useToastStore()
  const [logs, setLogs] = useState<string[]>([])
  const { data: status } = useBotStatus()
  const { data: strategies = [] } = useStrategies()
  const runBot = useRunBot()
  const toggleStrategy = useToggleStrategy()

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString()
    setLogs((prev) => [`[${time}] ${msg}`, ...prev].slice(0, 50))
  }

  const handleRunNow = async () => {
    addLog('Cycle manuel lance...')
    try {
      await runBot.mutateAsync()
      addLog('Cycle termine')
      addToast('success', 'Cycle bot execute avec succes')
    } catch {
      addLog('Erreur: timeout Binance testnet')
    }
  }

  const handleToggle = async (id: number, name: string, active: boolean) => {
    await toggleStrategy.mutateAsync({ id, active })
    addLog(`${name} ${active ? 'desactivee' : 'activee'}`)
    addToast(active ? 'info' : 'success', `${name} ${active ? 'desactivee' : 'activee'}`)
  }

  const activeCount = strategies.filter((s: any) => s.is_active).length

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
        </div>
        <div className="bg-gray-900 p-5 rounded-xl">
          <p className="text-gray-400 text-sm mb-2">Prochain cycle</p>
          <p className="text-sm font-mono">{status?.next_run ? new Date(status.next_run).toLocaleTimeString() : '...'}</p>
        </div>
        <div className="bg-gray-900 p-5 rounded-xl">
          <p className="text-gray-400 text-sm mb-2">Strategies actives</p>
          <p className="text-xl font-bold text-green-400">{activeCount} / {strategies.length}</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button onClick={handleRunNow} disabled={runBot.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
          <Zap size={16} />
          {runBot.isPending ? 'Execution...' : 'Lancer maintenant'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 p-5 rounded-xl">
          <h3 className="font-semibold mb-3">Strategies</h3>
          <div className="space-y-2">
            {strategies.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.strategy_type} · {s.symbol} · {s.timeframe}</p>
                </div>
                <button onClick={() => handleToggle(s.id, s.name, s.is_active)}
                  className={`px-3 py-1 rounded text-xs ${s.is_active ? 'bg-green-600 hover:bg-red-600' : 'bg-gray-600 hover:bg-green-600'}`}>
                  {s.is_active ? 'Actif' : 'Inactif'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 p-5 rounded-xl">
          <h3 className="font-semibold mb-3">Logs</h3>
          <div className="h-64 overflow-y-auto space-y-1 font-mono text-xs text-gray-400">
            {logs.length === 0 && <p className="text-gray-600">Aucun log</p>}
            {logs.map((log, i) => <p key={i}>{log}</p>)}
          </div>
        </div>
      </div>
    </div>
  )
}
