import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, LineStyle, UTCTimestamp } from 'lightweight-charts'
import { PageHeader, Card } from '../UI/Components'
import { useOhlcv, useOpenTrades, useTradeHistory } from '../../hooks/useTrading'
import History from '../Trading/History'

const PAIRS = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT']
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d']

const GREEN = '#22c55e'
const RED = '#ef4444'

const selectCls = 'px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 outline-none focus:border-cyan-500/50'

function snap(tsMs: number, times: number[]): number | null {
  if (!times.length) return null
  const t = Math.floor(tsMs / 1000)
  let best = times[0]
  for (const c of times) {
    if (Math.abs(c - t) < Math.abs(best - t)) best = c
  }
  return best
}

export default function ChartPage() {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const [symbol, setSymbol] = useState('BTC/USDT')
  const [timeframe, setTimeframe] = useState('1h')
  const [showClosed, setShowClosed] = useState(true)

  const [base, quote] = symbol.split('/')
  const { data: candles = [], isLoading } = useOhlcv(base, quote, timeframe, 400)
  const { data: openTrades = [] } = useOpenTrades()
  const { data: history = [] } = useTradeHistory(100)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (view !== 'chart' || !containerRef.current || !candles.length) return

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 520,
      layout: { background: { type: ColorType.Solid, color: '#09090b' }, textColor: '#a1a1aa' },
      grid: { vertLines: { color: '#18181b' }, horzLines: { color: '#18181b' } },
      rightPriceScale: { borderColor: '#27272a' },
      timeScale: { borderColor: '#27272a', timeVisible: true },
    })

    const series = chart.addCandlestickSeries({
      upColor: GREEN, downColor: RED, wickUpColor: GREEN, wickDownColor: RED, borderVisible: false,
    })

    const data = candles
      .map((c: any) => ({ time: Math.floor(c.timestamp / 1000) as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close }))
      .sort((a: any, b: any) => a.time - b.time)
    series.setData(data)

    const times = data.map((d: any) => d.time as number)
    const markers: any[] = []

    openTrades
      .filter((t: any) => t.symbol === symbol)
      .forEach((t: any) => {
        const et = snap(new Date(t.opened_at).getTime(), times)
        if (et !== null) {
          markers.push({
            time: et as UTCTimestamp,
            position: t.side === 'BUY' ? 'belowBar' : 'aboveBar',
            color: t.side === 'BUY' ? GREEN : RED,
            shape: t.side === 'BUY' ? 'arrowUp' : 'arrowDown',
            text: t.strategy_name || t.side,
          })
        }
        if (t.stop_loss) {
          series.createPriceLine({ price: t.stop_loss, color: RED, lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: `SL ${Math.round(t.stop_loss)}` })
        }
        if (t.take_profit) {
          series.createPriceLine({ price: t.take_profit, color: GREEN, lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: `TP ${Math.round(t.take_profit)}` })
        }
      })

    if (showClosed) {
      history
        .filter((t: any) => t.symbol === symbol)
        .forEach((t: any) => {
          const et = snap(new Date(t.opened_at).getTime(), times)
          const xt = t.closed_at ? snap(new Date(t.closed_at).getTime(), times) : null
          if (et !== null) {
            markers.push({
              time: et as UTCTimestamp,
              position: t.side === 'BUY' ? 'belowBar' : 'aboveBar',
              color: t.side === 'BUY' ? GREEN : RED,
              shape: t.side === 'BUY' ? 'arrowUp' : 'arrowDown',
              text: '',
            })
          }
          if (xt !== null) {
            const win = (t.pnl ?? 0) >= 0
            markers.push({
              time: xt as UTCTimestamp,
              position: 'aboveBar',
              color: win ? GREEN : RED,
              shape: 'circle',
              text: `${win ? '+' : ''}${t.pnl} USDT`,
            })
          }
          if (et !== null && xt !== null && et !== xt) {
            const link = chart.addLineSeries({ color: '#6b7280', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false })
            link.setData([
              { time: et as UTCTimestamp, value: t.entry_price },
              { time: xt as UTCTimestamp, value: t.exit_price },
            ])
          }
        })
    }

    markers.sort((a, b) => (a.time as number) - (b.time as number))
    series.setMarkers(markers)
    chart.timeScale().fitContent()

    const ro = new ResizeObserver(() => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth })
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
    }
  }, [view, candles, openTrades, history, showClosed, symbol])

  return (
    <div>
      <PageHeader title="Chart" sub="Bougies et trades" />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex rounded-lg overflow-hidden border border-zinc-700">
          <button onClick={() => setView('chart')} className={`px-4 py-2 text-sm ${view === 'chart' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-zinc-800 text-zinc-400'}`}>Chart</button>
          <button onClick={() => setView('table')} className={`px-4 py-2 text-sm ${view === 'table' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-zinc-800 text-zinc-400'}`}>Tableau</button>
        </div>

        <div className="flex-1" />

        {view === 'chart' && (
          <>
            <button
              onClick={() => setShowClosed(!showClosed)}
              className={`px-3 py-2 rounded-lg text-sm border ${showClosed ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
            >
              Trades fermes
            </button>
            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className={selectCls}>
              {TIMEFRAMES.map((tf) => <option key={tf} value={tf}>{tf}</option>)}
            </select>
          </>
        )}
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className={selectCls}>
          {PAIRS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {view === 'table' ? (
        <History />
      ) : (
        <Card>
          {isLoading ? (
            <div className="h-[520px] flex items-center justify-center text-zinc-600 text-sm">Chargement du chart...</div>
          ) : !candles.length ? (
            <div className="h-[520px] flex items-center justify-center text-zinc-600 text-sm">Aucune donnee</div>
          ) : (
            <div ref={containerRef} className="w-full" />
          )}
        </Card>
      )}
    </div>
  )
}
