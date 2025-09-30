import { useCallback, useMemo, useRef, useState } from 'react'
import './App.css'
import { login, postChatMessage } from './api'
import { clearStoredToken, getStoredToken, setStoredToken } from './auth'

type Message = { role: 'assistant' | 'user'; text: string }

function App() {
  const [token, setToken] = useState(() => getStoredToken() || '')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [chatIdInput, setChatIdInput] = useState('')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const isUuid = (value: string) => /^[0-9a-fA-F-]{32,36}$/.test(value.trim())

  const canSend = useMemo(() => {
    return !!token && isUuid(chatIdInput) && !isLoading
  }, [token, chatIdInput, isLoading])

  const send = useCallback(async () => {
    if (!canSend) return
    const chatId = chatIdInput.trim()
    if (!isUuid(chatId)) return
    const userText = input.trim()
    setInput('')
    if (userText) {
      setMessages((prev) => [...prev, { role: 'user', text: userText }])
    }
    setIsLoading(true)
    try {
      const text = await postChatMessage({ token, chatId, message: userText || undefined })
      setMessages((prev) => [...prev, { role: 'assistant', text }])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Error: ${err?.message || 'Unknown error'}` },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }, [canSend, chatIdInput, input, token])

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'left' }}>
      <h1>Conversation App</h1>

      <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        {!token ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  try {
                    const res = await login({ username, password })
                    setStoredToken(res.token)
                    setToken(res.token)
                  } catch (err: any) {
                    alert(err?.message || 'Login failed')
                  }
                }
              }}
            />
            <button
              onClick={async () => {
                try {
                  const res = await login({ username, password })
                  setStoredToken(res.token)
                  setToken(res.token)
                } catch (err: any) {
                  alert(err?.message || 'Login failed')
                }
              }}
              disabled={!username || !password}
            >
              Log in
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              placeholder="API Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <button
              onClick={() => {
                clearStoredToken()
                setToken('')
                setUsername('')
                setPassword('')
              }}
            >
              Log out
            </button>
          </div>
        )}
        <input
          placeholder="Chat ID"
          value={chatIdInput}
          onChange={(e) => setChatIdInput(e.target.value)}
        />
      </div>

      <div style={{ border: '1px solid #444', borderRadius: 8, padding: 12, minHeight: 240, marginBottom: 12 }}>
        {messages.length === 0 ? (
          <div style={{ color: '#888' }}>No messages yet.</div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <strong>{m.role === 'user' ? 'You' : 'Assistant'}: </strong>
              <span>{m.text}</span>
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          ref={inputRef}
          placeholder="Type a message... (empty to start chat)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send()
          }}
          style={{ flex: 1 }}
        />
        <button disabled={!canSend} onClick={send}>
          {isLoading ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  )
}

export default App
