import { useState } from 'react'
import api from '../../services/api'
import { Card, Button, PageHeader } from '../UI/Components'

const inputCls = 'w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 outline-none focus:border-cyan-500/50 transition-colors placeholder-zinc-600'

export default function Settings() {
  const [telegramMsg, setTelegramMsg] = useState('Test du bot trading!')
  const [telegramResult, setTelegramResult] = useState<any>(null)
  const [aiTexts, setAiTexts] = useState('Bitcoin is pumping, whales are buying massively')
  const [aiResult, setAiResult] = useState<any>(null)
  const [briefing, setBriefing] = useState<any>(null)
  const [loading, setLoading] = useState('')

  const testTelegram = async () => {
    setLoading('telegram')
    try {
      const { data } = await api.post(`/notifications/test?message=${encodeURIComponent(telegramMsg)}`)
      setTelegramResult(data)
    } catch {
      setTelegramResult({ error: 'Echec — verifiez TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID dans .env' })
    }
    setLoading('')
  }

  const testSignal = async () => {
    setLoading('signal')
    try {
      const { data } = await api.post('/notifications/test-signal')
      setTelegramResult(data)
    } catch {
      setTelegramResult({ error: 'Echec' })
    }
    setLoading('')
  }

  const testSentiment = async () => {
    setLoading('sentiment')
    try {
      const texts = aiTexts.split('\n').filter((t) => t.trim())
      const { data } = await api.post('/ai/sentiment', texts)
      setAiResult(data)
    } catch {
      setAiResult({ error: 'Echec — verifiez CLAUDE_API_KEY ou OPENAI_API_KEY dans .env' })
    }
    setLoading('')
  }

  const testBriefing = async () => {
    setLoading('briefing')
    try {
      const { data } = await api.get('/ai/briefing/BTC/USDT')
      setBriefing(data)
    } catch {
      setBriefing({ error: 'Echec' })
    }
    setLoading('')
  }

  const ResultBlock = ({ data }: { data: any }) => (
    <div className={`mt-3 p-3 rounded-lg text-xs font-mono ${data?.error ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'}`}>
      <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
    </div>
  )

  return (
    <div>
      <PageHeader title="Parametres" sub="Configuration et tests des intégrations" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card>
          <h3 className="font-semibold text-zinc-100 mb-4">Telegram</h3>
          <div className="space-y-3">
            <input value={telegramMsg} onChange={(e) => setTelegramMsg(e.target.value)}
              placeholder="Message test" className={inputCls} />
            <div className="flex gap-2">
              <Button onClick={testTelegram} disabled={loading === 'telegram'} className="flex-1">
                {loading === 'telegram' ? '...' : 'Envoyer message'}
              </Button>
              <Button onClick={testSignal} disabled={loading === 'signal'} variant="ghost" className="flex-1">
                {loading === 'signal' ? '...' : 'Test signal'}
              </Button>
            </div>
            {telegramResult && <ResultBlock data={telegramResult} />}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-zinc-100 mb-4">Intelligence Artificielle</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Textes pour analyse sentiment (1 par ligne)</label>
              <textarea value={aiTexts} onChange={(e) => setAiTexts(e.target.value)} rows={3}
                className={`${inputCls} resize-none`} />
            </div>
            <div className="flex gap-2">
              <Button onClick={testSentiment} disabled={loading === 'sentiment'} className="flex-1">
                {loading === 'sentiment' ? '...' : 'Analyser sentiment'}
              </Button>
              <Button onClick={testBriefing} disabled={loading === 'briefing'} variant="ghost" className="flex-1">
                {loading === 'briefing' ? '...' : 'Briefing BTC'}
              </Button>
            </div>
            {aiResult && <ResultBlock data={aiResult} />}
            {briefing && <ResultBlock data={briefing} />}
          </div>
        </Card>

      </div>
    </div>
  )
}
