import { useState } from 'react'
import { Card, Badge, Button, PageHeader } from '../UI/Components'
import { SkeletonList } from '../UI/Skeleton'
import { useStrategies, useStrategyTypes, useToggleStrategy, useCreateStrategy, useDeleteStrategy } from '../../hooks/useTrading'
import { useToastStore } from '../../store/toastStore'
import { Trash2 } from 'lucide-react'

const LEVELS: Record<string, 'success' | 'warning' | 'info'> = {
  rsi_oversold: 'success', macd_crossover: 'success', sma_crossover: 'success', bollinger_bounce: 'success',
  grid_trading: 'warning', dca_bot: 'warning', rsi_macd_combo: 'warning',
  mtf_confluence: 'info', bos_structure: 'info', liquidity_sweep: 'info',
}

const LEVEL_LABELS: Record<string, string> = {
  rsi_oversold: 'Debutant', macd_crossover: 'Debutant', sma_crossover: 'Debutant', bollinger_bounce: 'Debutant',
  grid_trading: 'Intermediaire', dca_bot: 'Intermediaire', rsi_macd_combo: 'Intermediaire',
  mtf_confluence: 'Avance', bos_structure: 'Avance', liquidity_sweep: 'Avance',
}

const DEFAULT_FORM = {
  name: '',
  strategy_type: '',
  symbol: 'BTC/USDT',
  timeframe: 'auto',
}

function buildAutoName(type: string, symbol: string): string {
  if (!type) return ''
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${String(d.getFullYear()).slice(-2)}`
  const time = `${pad(d.getHours())}h${pad(d.getMinutes())}`
  return `${type}_${symbol}_${date}_${time}`
}

const inputCls = 'w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 outline-none focus:border-cyan-500/50 transition-colors'
const labelCls = 'text-xs text-zinc-500 mb-1 block'

export default function Strategies() {
  const { addToast } = useToastStore()
  const { data: strategies = [], isLoading } = useStrategies()
  const { data: types = [] } = useStrategyTypes()
  const toggleStrategy = useToggleStrategy()
  const createStrategy = useCreateStrategy()
  const deleteStrategy = useDeleteStrategy()
  const [form, setForm] = useState(DEFAULT_FORM)
  const [autoName, setAutoName] = useState(true)

  const finalName = autoName ? buildAutoName(form.strategy_type, form.symbol) : form.name

  const handleCreate = async () => {
    if (!finalName || !form.strategy_type) return
    await createStrategy.mutateAsync({ ...form, name: finalName })
    setForm(DEFAULT_FORM)
    addToast('success', 'Strategie creee')
  }

  const handleToggle = async (id: number, active: boolean, name: string) => {
    await toggleStrategy.mutateAsync({ id, active })
    addToast(active ? 'info' : 'success', `${name} ${active ? 'desactivee' : 'activee'}`)
  }

  const handleDelete = async (id: number, name: string) => {
    await deleteStrategy.mutateAsync(id)
    addToast('info', `${name} supprimee`)
  }

  return (
    <div>
      <PageHeader title="Strategies" sub={`${strategies.length} strategies configurées`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="font-semibold text-zinc-100 mb-4">Nouvelle strategie</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelCls + ' mb-0'}>Nom</label>
                <button
                  type="button"
                  onClick={() => setAutoName(!autoName)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                    autoName
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'bg-zinc-700 text-zinc-400'
                  }`}
                >
                  {autoName ? 'Auto' : 'Manuel'}
                </button>
              </div>
              {autoName ? (
                <div className={inputCls + ' text-zinc-400 font-mono text-xs truncate'}>
                  {finalName || 'Choisir un type...'}
                </div>
              ) : (
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ex: dca_4h" className={inputCls} />
              )}
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select value={form.strategy_type} onChange={(e) => setForm({ ...form, strategy_type: e.target.value })} className={inputCls}>
                <option value="">Choisir...</option>
                {types.map((t: string) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Paire</label>
              <select value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} className={inputCls}>
                <option>BTC/USDT</option>
                <option>ETH/USDT</option>
                <option>BNB/USDT</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Timeframe</label>
              <select value={form.timeframe} onChange={(e) => setForm({ ...form, timeframe: e.target.value })} className={inputCls}>
                <option value="auto">Auto</option>
                {['15m', '1h', '4h'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <p className="text-xs text-zinc-600">
              Stop Loss et Take Profit calcules automatiquement selon la volatilite (ATR).
            </p>
            <Button onClick={handleCreate} disabled={createStrategy.isPending || !finalName || !form.strategy_type} className="w-full">
              {createStrategy.isPending ? 'Creation...' : 'Creer la strategie'}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-semibold text-zinc-100 mb-4">Mes strategies ({strategies.length})</h3>
            {isLoading ? (
              <SkeletonList items={4} />
            ) : strategies.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-8">Aucune strategie. Créez-en une.</p>
            ) : (
              <div className="space-y-2">
                {strategies.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-zinc-100 text-sm">{s.name}</p>
                        <Badge variant={LEVELS[s.strategy_type] || 'neutral'}>
                          {LEVEL_LABELS[s.strategy_type] || s.strategy_type}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">
                        {s.strategy_type} · {s.symbol} · {s.timeframe}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <button
                        onClick={() => handleToggle(s.id, s.is_active, s.name)}
                        disabled={toggleStrategy.isPending}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 ${
                          s.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-700 text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-400'
                        }`}
                      >
                        {s.is_active ? 'Actif' : 'Inactif'}
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.name)}
                        disabled={deleteStrategy.isPending}
                        className="p-1.5 text-zinc-600 hover:text-rose-400 transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
