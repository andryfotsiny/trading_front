// src/components/Auth/Register.tsx
import { useState } from 'react'
import { useStore } from '../../store'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const register = useStore((s) => s.register)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await register(email, username, password)
      navigate('/login')
    } catch {
      setError('Erreur lors de la creation')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Creer un compte</h1>
        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text" placeholder="Username" value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
          />
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
          <button type="submit" className="w-full p-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium">
            Creer le compte
          </button>
        </form>
        <p className="text-gray-400 text-sm mt-4 text-center">
          Deja un compte? <Link to="/login" className="text-blue-400">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
