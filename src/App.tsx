// src/App.tsx
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import AppLayout from './components/Layout/AppLayout'
import Dashboard from './components/Dashboard/Dashboard'
import BotPage from './components/Bot/Bot'
import Trading from './components/Trading/Trading'
import Strategies from './components/Strategies/Strategies'
import Backtest from './components/Backtest/Backtest'
import Optimizer from './components/Optimizer/Optimizer'
import Calendar from './components/Calendar/Calendar'
import History from './components/Trading/History'
import Settings from './components/Settings/Settings'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useStore((s) => s.token)
  if (!token) return <Navigate to="/login" />
  return <>{children}</>
}

export default function App() {
  const { token, fetchMe } = useStore()

  useEffect(() => {
    if (token) fetchMe().catch(() => {})
  }, [token])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="bot" element={<BotPage />} />
          <Route path="trading" element={<Trading />} />
          <Route path="strategies" element={<Strategies />} />
          <Route path="backtest" element={<Backtest />} />
          <Route path="optimizer" element={<Optimizer />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
