import { useState } from 'react'
import { Card, Badge, PageHeader, Table } from '../UI/Components'
import { SkeletonTable, SkeletonCard } from '../UI/Skeleton'
import { useTradeHistory } from '../../hooks/useTrading'

export default function History() {
  const [filter, setFilter] = useState('all')
  const { data: trades = [], isLoading } = useTradeHistory(100)

  const filtered = filter === 'all' ? trades
    : filter === 'wins' ? trades.filter((t: any) => (t.pnl || 0) > 0)
    : trades.filter((t: any) => (t.pnl || 0) < 0)

  const totalPnl = trades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0)
  const wins = trades.filter((t: any) => (t.pnl || 0) > 0).length
  const losses = trades.filter((t: any) => (t.pnl || 0) < 0).length

  return (
    <div>
      <PageHeader title="Historique des trades" sub={`${trades.length} trades fermés`} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          [
            { label: 'Total trades', value: trades.length, color: 'text-zinc-100' },
            { label: 'TP (gains)', value: wins, color: 'text-emerald-400' },
            { label: 'SL (pertes)', value: losses, color: 'text-rose-400' },
            { label: 'PnL Total', value: `${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} USDT`, color: totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400' },
          ].map((item) => (
            <Card key={item.label} className="text-center py-3">
              <p className="text-xs text-zinc-500 mb-1">{item.label}</p>
              <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
            </Card>
          ))
        )}
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'wins', label: 'Gains (TP)' },
          { key: 'losses', label: 'Pertes (SL)' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              filter === f.key
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        {isLoading ? (
          <SkeletonTable rows={5} cols={9} />
        ) : filtered.length === 0 ? (
          <p className="text-zinc-600 text-sm text-center py-8">Aucun trade</p>
        ) : (
          <Table headers={['Paire', 'Side', 'Strategie', 'Entree', 'Sortie', 'PnL', 'PnL %', 'Type', 'Date']}>
            {filtered.map((t: any) => (
              <tr key={t.id}>
                <td className="py-3 px-2 text-zinc-100 text-sm font-medium">{t.symbol}</td>
                <td className="py-3 px-2 text-center">
                  <Badge variant={t.side === 'BUY' ? 'success' : 'danger'}>{t.side}</Badge>
                </td>
                <td className="py-3 px-2 text-center text-cyan-400 text-sm">{t.strategy_name || 'manual'}</td>
                <td className="py-3 px-2 text-center text-zinc-300 text-sm font-mono">${t.entry_price}</td>
                <td className="py-3 px-2 text-center text-zinc-300 text-sm font-mono">${t.exit_price}</td>
                <td className={`py-3 px-2 text-center text-sm font-mono font-medium ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.pnl >= 0 ? '+' : ''}{t.pnl} USDT
                </td>
                <td className={`py-3 px-2 text-center text-sm ${t.pnl_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.pnl_pct >= 0 ? '+' : ''}{t.pnl_pct}%
                </td>
                <td className="py-3 px-2 text-center">
                  <Badge variant={t.is_paper ? 'neutral' : 'info'}>{t.is_paper ? 'Paper' : 'Reel'}</Badge>
                </td>
                <td className="py-3 px-2 text-center text-zinc-500 text-xs">{t.closed_at?.split('T')[0]}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}
