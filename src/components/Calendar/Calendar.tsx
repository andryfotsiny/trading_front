// src/components/Calendar/Calendar.tsx
import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Activity, AlertTriangle, TrendingUp, TrendingDown, Shield } from 'lucide-react'

export default function Calendar() {
  const [fng, setFng] = useState<any>(null)
  const [fngHistory, setFngHistory] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [shouldTrade, setShouldTrade] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const refresh = async () => {
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

  useEffect(() => { refresh() }, [])

  const getFngColor = (value: number) => {
    if (value <= 20) return 'text-red-500'
    if (value <= 35) return 'text-orange-400'
    if (value <= 55) return 'text-yellow-400'
    if (value <= 75) return 'text-green-400'
    return 'text-green-600'
  }

  const getFngBg = (value: number) => {
    if (value <= 20) return 'bg-red-900/30'
    if (value <= 35) return 'bg-orange-900/30'
    if (value <= 55) return 'bg-yellow-900/30'
    if (value <= 75) return 'bg-green-900/30'
    return 'bg-green-900/50'
  }

  const getImpactColor = (impact: string) => {
    if (impact === 'HIGH') return 'bg-red-600'
    if (impact === 'MEDIUM') return 'bg-yellow-600'
    return 'bg-gray-600'
  }

  const filtered = filter === 'all' ? events
    : filter === 'high' ? events.filter(e => e.impact_label === 'HIGH')
    : events.filter(e => e.impact_label === 'MEDIUM')

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Calendrier Economique</h2>

      {shouldTrade && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${shouldTrade.can_trade ? 'bg-green-900/20 border border-green-800' : 'bg-red-900/20 border border-red-800'}`}>
          <Shield size={24} className={shouldTrade.can_trade ? 'text-green-400' : 'text-red-400'} />
          <div>
            <p className={`font-bold ${shouldTrade.can_trade ? 'text-green-400' : 'text-red-400'}`}>
              {shouldTrade.can_trade ? 'Trading autorise' : 'Trading en PAUSE'}
            </p>
            {shouldTrade.reasons && shouldTrade.reasons.length > 0 && (
              <p className="text-sm text-gray-400 mt-1">{shouldTrade.reasons.join(' | ')}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {fng && (
          <div className={`p-5 rounded-xl ${getFngBg(fng.value)}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Fear & Greed Index</h3>
              {fng.value <= 40 ? <TrendingDown size={20} className="text-red-400" /> : <TrendingUp size={20} className="text-green-400" />}
            </div>
            <p className={`text-5xl font-bold mb-2 ${getFngColor(fng.value)}`}>{fng.value}</p>
            <p className={`text-lg ${getFngColor(fng.value)}`}>{fng.classification}</p>
            <p className="text-sm text-gray-400 mt-2">{fng.advice}</p>
            <div className="mt-3 w-full bg-gray-800 rounded-full h-3">
              <div className={`h-3 rounded-full ${fng.value <= 35 ? 'bg-red-500' : fng.value <= 55 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${fng.value}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Extreme Fear</span><span>Neutral</span><span>Extreme Greed</span>
            </div>
          </div>
        )}

        <div className="lg:col-span-2 bg-gray-900 p-5 rounded-xl">
          <h3 className="font-semibold mb-3">Historique Fear & Greed (30 jours)</h3>
          {fngHistory.length > 0 ? (
            <div className="flex items-end gap-1 h-32">
              {fngHistory.slice().reverse().map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t ${h.value <= 35 ? 'bg-red-500' : h.value <= 55 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ height: `${h.value * 1.2}px` }}
                    title={`${h.value} - ${h.classification}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Chargement...</p>
          )}
        </div>
      </div>

      <div className="bg-gray-900 p-5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-blue-400" />
            <h3 className="font-semibold">Evenements economiques</h3>
          </div>
          <div className="flex gap-1">
            {['all', 'high', 'medium'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-xs ${filter === f ? 'bg-blue-600' : 'bg-gray-800'}`}>
                {f === 'all' ? 'Tous' : f === 'high' ? 'Haute importance' : 'Moyenne'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-900"><tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left py-2 px-2">Date</th>
                <th className="text-left px-2">Pays</th>
                <th className="text-left px-2">Evenement</th>
                <th className="px-2">Impact</th>
                <th className="px-2">Prevision</th>
                <th className="px-2">Precedent</th>
                <th className="px-2">Actuel</th>
              </tr></thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="py-2 px-2 text-gray-400 text-xs whitespace-nowrap">{e.date?.split('T')[0]}<br/>{e.date?.split('T')[1]?.slice(0,5)}</td>
                    <td className="px-2">{e.country}</td>
                    <td className="px-2 font-medium">{e.event}</td>
                    <td className="px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs text-white ${getImpactColor(e.impact_label)}`}>
                        {e.impact_label}
                      </span>
                    </td>
                    <td className="px-2 text-center text-gray-400">{e.estimate ?? '-'}</td>
                    <td className="px-2 text-center text-gray-400">{e.prev ?? '-'}</td>
                    <td className={`px-2 text-center font-medium ${e.actual ? 'text-blue-400' : 'text-gray-600'}`}>{e.actual ?? 'A venir'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            {loading ? (
              <p className="text-gray-500">Chargement...</p>
            ) : (
              <div>
                <AlertTriangle size={24} className="mx-auto text-yellow-400 mb-2" />
                <p className="text-gray-400">Aucun evenement trouve</p>
                <p className="text-xs text-gray-600 mt-1">Ajoutez FINNHUB_API_KEY dans .env pour le calendrier economique</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
