// src/components/Auth/Login.tsx
import { useState } from 'react'
import { useStore } from '../../store'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const login = useStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Email ou mot de passe incorrect')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Trading Bot</h1>
        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
          />
          <input
            type="password" placeholder="Mot de passe" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
          />
          <button type="submit" className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">
            Connexion
          </button>
        </form>
        <p className="text-gray-400 text-sm mt-4 text-center">
          Pas de compte? <Link to="/register" className="text-blue-400">Creer un compte</Link>
        </p>
      </div>
    </div>
  )
}
