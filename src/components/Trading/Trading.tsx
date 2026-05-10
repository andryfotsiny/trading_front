import { useState } from 'react'
import { useToastStore } from '../../store/toastStore'
import { Card, Badge, Button, Table, PageHeader } from '../UI/Components'
import { SkeletonTable, SkeletonCard } from '../UI/Skeleton'
import { Modal } from '../UI/Modal'
import { useOpenTrades, useBtcPrice, useCloseTrade, useCheckExits } from '../../hooks/useTrading'

export default function Trading() {
  const { addToast } = useToastStore()
  const { data: trades = [], isLoading: tradesLoading } = useOpenTrades()
  const { data: price } = useBtcPrice()
  const closeTrade = useCloseTrade()
  const checkExits = useCheckExits()
  const [confirmTrade, setConfirmTrade] = useState<{ id: number; symbol: string; side: string; entry: number } | null>(null)

  const handleCloseConfirm = async () => {
    if (!confirmTrade) return
    const result = await closeTrade.mutateAsync(confirmTrade.id)
    if (result.pnl !== undefined) {
      addToast(result.pnl >= 0 ? 'success' : 'info', `Trade #${confirmTrade.id} ferme. PnL: ${result.pnl} USDT`)
    }
    setConfirmTrade(null)
  }

  const handleCheckExits = async () => {
    const result = await checkExits.mutateAsync()
    if (result.closed?.length > 0) {
      addToast('success', `${result.closed.length} trade(s) ferme(s) automatiquement`)
    } else {
      addToast('info', 'Aucun SL/TP touche.')
    }
  }

  return (
    <div>
      <PageHeader title="Trading" sub="Gestion des trades ouverts" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {tradesLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <Card className="text-center">
              <p className="text-xs text-zinc-500 mb-1">Trades ouverts</p>
              <p className="text-2xl font-bold text-amber-400">{trades.length}</p>
            </Card>
            <Card className="text-center">
              <p className="text-xs text-zinc-500 mb-1">Prix BTC</p>
              <p className="text-xl font-bold text-cyan-400 font-mono">{price ? `$${price.toLocaleString()}` : '—'}</p>
            </Card>
            <Card className="text-center">
              <p className="text-xs text-zinc-500 mb-1">Exposition totale</p>
              <p className="text-xl font-bold text-zinc-100">
                {trades.length > 0 && price
                  ? `$${(trades.reduce((s: number, t: any) => s + t.quantity * t.entry_price, 0)).toFixed(0)}`
                  : '—'}
              </p>
            </Card>
          </>
        )}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-zinc-100">
            Trades ouverts
            <span className="ml-2 text-sm font-normal text-zinc-500">({trades.length})</span>
          </h3>
          <Button onClick={handleCheckExits} disabled={checkExits.isPending} variant="warning" size="sm">
            {checkExits.isPending ? 'Verification...' : 'Verifier SL/TP'}
          </Button>
        </div>

        {tradesLoading ? (
          <SkeletonTable rows={3} cols={9} />
        ) : trades.length === 0 ? (
          <p className="text-zinc-600 text-sm text-center py-8">Aucun trade ouvert</p>
        ) : (
          <Table headers={['Paire', 'Side', 'Strategie', 'Entree', 'Actuel', 'SL', 'TP', 'Qté', 'Action']}>
            {trades.map((t: any) => (
              <tr key={t.id}>
                <td className="py-3 px-2 text-zinc-100 text-sm font-medium">{t.symbol}</td>
                <td className="py-3 px-2 text-center"><Badge variant={t.side === 'BUY' ? 'success' : 'danger'}>{t.side}</Badge></td>
                <td className="py-3 px-2 text-center text-cyan-400 text-sm">{t.strategy_name || '—'}</td>
                <td className="py-3 px-2 text-center text-zinc-300 text-sm font-mono">${t.entry_price}</td>
                <td className="py-3 px-2 text-center text-cyan-300 text-sm font-mono">${price || '—'}</td>
                <td className="py-3 px-2 text-center text-rose-400 text-sm font-mono">${t.stop_loss}</td>
                <td className="py-3 px-2 text-center text-emerald-400 text-sm font-mono">${t.take_profit}</td>
                <td className="py-3 px-2 text-center text-zinc-400 text-xs">{t.quantity}</td>
                <td className="py-3 px-2 text-center">
                  <Button onClick={() => setConfirmTrade({ id: t.id, symbol: t.symbol, side: t.side, entry: t.entry_price })} variant="danger" size="sm">
                    Fermer
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        open={!!confirmTrade}
        onClose={() => setConfirmTrade(null)}
        onConfirm={handleCloseConfirm}
        title="Fermer le trade"
        confirmLabel="Confirmer la fermeture"
        confirmVariant="danger"
        loading={closeTrade.isPending}
      >
        {confirmTrade && (
          <div className="space-y-3">
            <p className="text-zinc-400 text-sm">Fermer ce trade au prix du marché ?</p>
            <div className="bg-zinc-800 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-zinc-500">Paire</span><span className="text-zinc-100">{confirmTrade.symbol}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Side</span><Badge variant={confirmTrade.side === 'BUY' ? 'success' : 'danger'}>{confirmTrade.side}</Badge></div>
              <div className="flex justify-between"><span className="text-zinc-500">Prix entree</span><span className="text-zinc-100 font-mono">${confirmTrade.entry}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Prix actuel</span><span className="text-cyan-400 font-mono">${price || '—'}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
