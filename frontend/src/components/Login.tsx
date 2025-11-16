import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api'
import { setStoredToken } from '../auth'
import Button from './Button'
import Input from './Input'

interface LoginProps {
  onLogin: (token: string) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return

    setIsLoading(true)
    setError('')

    try {
      const response = await login({ username, password })
      setStoredToken(response.token)
      onLogin(response.token)
      navigate('/speech-practice')
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full p-8 m-8 space-y-8 rounded-lg shadow-lg
                      bg-secondary
                      ">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-white">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 text-white hover:text-accent"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8" onSubmit={handleSubmit}>
          <Input
            id="username"
            name="username"
            type="text"
            label="Username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              variant="primary"
              disabled={!username || !password}
              loading={isLoading}
              className="w-full"
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
