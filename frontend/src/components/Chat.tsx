import { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { postChatMessage } from '../api'
import Input from './Input'

type Message = { role: 'assistant' | 'user'; text: string }

interface ChatProps {
  token: string
}

export default function Chat({ token }: ChatProps) {
  const [searchParams] = useSearchParams()
  const [chatIdInput, setChatIdInput] = useState('')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  
  const theme = searchParams.get('theme')
  const scenario = searchParams.get('scenario')

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
    <div className="min-vh-100 bg-light py-4">
      <div className="container-fluid px-3">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-6">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h1 className="h4 mb-0">Chat Interface</h1>
                  {(theme || scenario) && (
                    <div className="text-end">
                      {theme && <small className="d-block opacity-75">Theme: {theme}</small>}
                      {scenario && <small className="d-block opacity-75">Scenario: {scenario}</small>}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card-body">
            <Input
              id="chatId"
              type="text"
              label="Chat ID (UUID)"
              placeholder="Enter chat ID (UUID format)"
              value={chatIdInput}
              onChange={(e) => setChatIdInput(e.target.value)}
              error={chatIdInput && !isUuid(chatIdInput) ? 'Please enter a valid UUID format' : undefined}
            />

                <div className="border rounded mb-4 bg-light chat-scroll" style={{ height: '400px', overflowY: 'auto' }}>
                  <div className="p-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted py-5">
                        <div className="mb-3">
                          <svg className="mx-auto" width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <p>No messages yet. Start a conversation!</p>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {messages.map((message, idx) => (
                          <div
                            key={idx}
                            className={`d-flex ${message.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                          >
                            <div
                              className={`px-3 py-2 rounded ${
                                message.role === 'user'
                                  ? 'bg-primary text-white'
                                  : 'bg-white text-dark border'
                              }`}
                              style={{ maxWidth: '70%' }}
                            >
                              <small>{message.text}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="input-group">
                  <input
                    ref={inputRef}
                    type="text"
                    className="form-control"
                    placeholder="Type a message... (empty to start chat)"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') send()
                    }}
                  />
                  <button
                    disabled={!canSend}
                    onClick={send}
                    className="btn btn-primary"
                    type="button"
                  >
                    {isLoading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
