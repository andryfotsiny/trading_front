import { useState } from 'react'
import { useToastStore } from '../../store/toastStore'
import { Zap } from 'lucide-react'
import { Card, Button, PageHeader } from '../UI/Components'
import { SkeletonList, SkeletonCard, Skeleton } from '../UI/Skeleton'
import { useBotStatus, useStrategies, useRunBot, useToggleStrategy } from '../../hooks/useTrading'

export default function Bot() {
  const { addToast } = useToastStore()
  const [logs, setLogs] = useState<string[]>([])
  const { data: status, isLoading: statusLoading } = useBotStatus()
  const { data: strategies = [], isLoading: strategiesLoading } = useStrategies()
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
      <PageHeader title="Bot Trading" sub="Gestion du bot automatique" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {statusLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-2.5 h-2.5 rounded-full ${status?.running ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className="text-zinc-400 text-sm">Statut</span>
              </div>
              <p className="text-xl font-bold text-zinc-100">{status?.running ? 'Actif' : 'Inactif'}</p>
            </Card>
            <Card>
              <p className="text-zinc-400 text-sm mb-2">Prochain cycle</p>
              <p className="text-sm font-mono text-zinc-200">{status?.next_run ? new Date(status.next_run).toLocaleTimeString() : '—'}</p>
            </Card>
            <Card>
              <p className="text-zinc-400 text-sm mb-2">Strategies actives</p>
              <p className="text-xl font-bold text-emerald-400">{activeCount} <span className="text-zinc-500 text-base font-normal">/ {strategies.length}</span></p>
            </Card>
          </>
        )}
      </div>

      <div className="mb-6">
        <Button onClick={handleRunNow} disabled={runBot.isPending} variant="primary">
          <span className="flex items-center gap-2">
            <Zap size={15} />
            {runBot.isPending ? 'Execution...' : 'Lancer maintenant'}
          </span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold text-zinc-100 mb-4">Strategies</h3>
          {strategiesLoading ? (
            <SkeletonList items={4} />
          ) : (
            <div className="space-y-2">
              {strategies.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <div>
                    <p className="font-medium text-zinc-100 text-sm">{s.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{s.strategy_type} · {s.symbol} · {s.timeframe}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(s.id, s.name, s.is_active)}
                    disabled={toggleStrategy.isPending}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 ${
                      s.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
                        : 'bg-zinc-700 text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
                    }`}
                  >
                    {toggleStrategy.isPending ? '...' : s.is_active ? 'Actif' : 'Inactif'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-zinc-100 mb-4">Logs</h3>
          <div className="h-64 overflow-y-auto space-y-1 font-mono text-xs text-zinc-500">
            {logs.length === 0 ? (
              <p className="text-zinc-700">Aucun log pour cette session</p>
            ) : (
              logs.map((log, i) => <p key={i}>{log}</p>)
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
