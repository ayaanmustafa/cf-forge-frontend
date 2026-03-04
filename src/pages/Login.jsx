import { useUser } from '../context/UserContext'
import { useState } from 'react'

const Login = () => {
  const [handle, setHandle] = useState('')
  const [error, setError] = useState('')
  const { login } = useUser()

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!handle.trim()) {
      setError('Please enter a Codeforces handle')
      return
    }

    login(handle.trim())
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">CF Forge</h1>
        <p className="text-zinc-400 mb-6">Competitive Programming Problem Tracker</p>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-zinc-400 mb-2">Codeforces Handle</label>
          <input
            type="text"
            value={handle}
            onChange={(e) => {
              setHandle(e.target.value)
              setError('')
            }}
            placeholder="e.g. tourist"
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 mb-4"
          />
          
          {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition"
          >
            Continue
          </button>
        </form>

        <p className="text-xs text-zinc-500 mt-6 text-center">
          Your data is tied to your Codeforces handle.
        </p>
      </div>
    </div>
  )
}

export default Login
