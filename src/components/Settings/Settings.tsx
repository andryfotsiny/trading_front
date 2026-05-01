// src/components/Settings/Settings.tsx
import { useState } from 'react'
import api from '../../services/api'

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
    } catch (e: any) {
      setTelegramResult({ error: 'Echec - verifiez TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID dans .env' })
    }
    setLoading('')
  }

  const testSignal = async () => {
    setLoading('signal')
    try {
      const { data } = await api.post('/notifications/test-signal')
      setTelegramResult(data)
    } catch (e: any) {
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
    } catch (e: any) {
      setAiResult({ error: 'Echec - verifiez CLAUDE_API_KEY ou OPENAI_API_KEY dans .env' })
    }
    setLoading('')
  }

  const testBriefing = async () => {
    setLoading('briefing')
    try {
      const { data } = await api.get('/ai/briefing/BTC/USDT')
      setBriefing(data)
    } catch (e: any) {
      setBriefing({ error: 'Echec' })
    }
    setLoading('')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Parametres</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-gray-900 p-5 rounded-xl">
          <h3 className="font-semibold mb-4">Telegram</h3>
          <div className="space-y-3">
            <input value={telegramMsg} onChange={(e) => setTelegramMsg(e.target.value)}
              placeholder="Message test" className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none" />
            <div className="flex gap-2">
              <button onClick={testTelegram} disabled={loading === 'telegram'}
                className="flex-1 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm disabled:opacity-50">
                {loading === 'telegram' ? '...' : 'Envoyer message test'}
              </button>
              <button onClick={testSignal} disabled={loading === 'signal'}
                className="flex-1 p-3 bg-green-600 hover:bg-green-700 rounded-lg text-sm disabled:opacity-50">
                {loading === 'signal' ? '...' : 'Tester signal'}
              </button>
            </div>
            {telegramResult && (
              <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded-lg overflow-auto max-h-40">
                {JSON.stringify(telegramResult, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div className="bg-gray-900 p-5 rounded-xl">
          <h3 className="font-semibold mb-4">Intelligence Artificielle</h3>
          <div className="space-y-3">
            <textarea value={aiTexts} onChange={(e) => setAiTexts(e.target.value)}
              placeholder="Textes a analyser (1 par ligne)" rows={3}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 outline-none resize-none" />
            <div className="flex gap-2">
              <button onClick={testSentiment} disabled={loading === 'sentiment'}
                className="flex-1 p-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm disabled:opacity-50">
                {loading === 'sentiment' ? '...' : 'Analyser sentiment'}
              </button>
              <button onClick={testBriefing} disabled={loading === 'briefing'}
                className="flex-1 p-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm disabled:opacity-50">
                {loading === 'briefing' ? '...' : 'Briefing BTC/USDT'}
              </button>
            </div>
            {aiResult && (
              <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded-lg overflow-auto max-h-40">
                {JSON.stringify(aiResult, null, 2)}
              </pre>
            )}
            {briefing && (
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-300">{briefing.briefing || JSON.stringify(briefing)}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
