import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Activity, AlertTriangle, TrendingUp, TrendingDown, Shield } from 'lucide-react'
import { Card, PageHeader } from '../UI/Components'

export default function Calendar() {
  const [fng, setFng] = useState<any>(null)
  const [fngHistory, setFngHistory] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [shouldTrade, setShouldTrade] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [fngRes, histRes, eventsRes, tradeRes] = await Promise.allSettled([
          api.get('/calendar/fear-greed'),
          api.get('/calendar/fear-greed/history'),
          api.get('/calendar/economic?importance=2'),
          api.get('/calendar/should-trade'),
        ])
        if (fngRes.status === 'fulfilled') setFng(fngRes.value.data)
        if (histRes.status === 'fulfilled') setFngHistory(histRes.value.data.history || [])
        if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data || [])
        if (tradeRes.status === 'fulfilled') setShouldTrade(tradeRes.value.data)
      } catch {}
      setLoading(false)
    }
    fetch()
  }, [])

  const getFngColor = (v: number) => v <= 20 ? 'text-rose-500' : v <= 35 ? 'text-orange-400' : v <= 55 ? 'text-amber-400' : 'text-emerald-400'
  const getImpactVariant = (impact: string) => impact === 'HIGH' ? 'bg-rose-600' : impact === 'MEDIUM' ? 'bg-amber-600' : 'bg-zinc-600'
  const filtered = filter === 'all' ? events : filter === 'high' ? events.filter(e => e.impact_label === 'HIGH') : events.filter(e => e.impact_label === 'MEDIUM')

  return (
    <div>
      <PageHeader title="Calendrier Economique" sub="Indicateurs de marché et événements" />

      {shouldTrade && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 border ${shouldTrade.can_trade ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
          <Shield size={20} className={shouldTrade.can_trade ? 'text-emerald-400' : 'text-rose-400'} />
          <div>
            <p className={`font-semibold text-sm ${shouldTrade.can_trade ? 'text-emerald-400' : 'text-rose-400'}`}>
              {shouldTrade.can_trade ? 'Trading autorisé' : 'Trading en PAUSE'}
            </p>
            {shouldTrade.reasons?.length > 0 && (
              <p className="text-xs text-zinc-500 mt-0.5">{shouldTrade.reasons.join(' | ')}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {fng && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-zinc-100">Fear & Greed Index</h3>
              {fng.value <= 40 ? <TrendingDown size={18} className="text-rose-400" /> : <TrendingUp size={18} className="text-emerald-400" />}
            </div>
            <p className={`text-5xl font-bold mb-1 ${getFngColor(fng.value)}`}>{fng.value}</p>
            <p className={`text-sm mb-3 ${getFngColor(fng.value)}`}>{fng.classification}</p>
            <p className="text-xs text-zinc-500 mb-3">{fng.advice}</p>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${fng.value <= 35 ? 'bg-rose-500' : fng.value <= 55 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${fng.value}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-600 mt-1">
              <span>Fear</span><span>Neutral</span><span>Greed</span>
            </div>
          </Card>
        )}

        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-zinc-100 mb-3">Fear & Greed — 30 jours</h3>
          {fngHistory.length > 0 ? (
            <div className="flex items-end gap-0.5 h-28">
              {fngHistory.slice().reverse().map((h: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative">
                  <div
                    className={`w-full rounded-sm ${h.value <= 35 ? 'bg-rose-500' : h.value <= 55 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ height: `${h.value}%` }}
                  />
                  <span className="absolute -top-5 text-xs text-zinc-400 opacity-0 group-hover:opacity-100 bg-zinc-800 px-1 rounded">{h.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 text-sm">Chargement...</p>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
            <Activity size={16} className="text-cyan-400" />
            Evenements economiques
          </h3>
          <div className="flex gap-2">
            {[{k:'all',l:'Tous'},{k:'high',l:'HIGH'},{k:'medium',l:'MEDIUM'}].map((f) => (
              <button key={f.k} onClick={() => setFilter(f.k)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${filter === f.k ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>
                {f.l}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <p className="text-zinc-600 text-sm">Chargement...</p>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Date', 'Pays', 'Evenement', 'Impact', 'Precedent', 'Prevu', 'Actuel'].map((h, i) => (
                    <th key={h} className={`py-3 px-2 text-xs font-medium text-zinc-400 uppercase tracking-wider ${i === 0 ? 'text-left' : 'text-center'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filtered.map((e: any, i: number) => (
                  <tr key={i}>
                    <td className="py-3 px-2 text-zinc-400 text-xs">{e.date} {e.time}</td>
                    <td className="py-3 px-2 text-center text-zinc-300 text-xs">{e.country}</td>
                    <td className="py-3 px-2 text-zinc-100 text-xs max-w-xs truncate">{e.event}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs text-white ${getImpactVariant(e.impact_label)}`}>{e.impact_label}</span>
                    </td>
                    <td className="py-3 px-2 text-center text-zinc-400 text-xs">{e.prev ?? '—'}</td>
                    <td className="py-3 px-2 text-center text-zinc-400 text-xs">{e.estimate ?? '—'}</td>
                    <td className={`py-3 px-2 text-center text-xs font-medium ${e.actual ? 'text-cyan-400' : 'text-zinc-600'}`}>{e.actual ?? 'A venir'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle size={20} className="mx-auto text-amber-400 mb-2" />
            <p className="text-zinc-500 text-sm">Aucun événement trouvé</p>
          </div>
        )}
      </Card>
    </div>
  )
}
