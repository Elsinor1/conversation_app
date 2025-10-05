import { useCallback, useMemo, useRef, useState } from 'react'
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
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg">
              <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h1 className="text-xl font-semibold">Chat Interface</h1>
                  {(theme || scenario) && (
                    <div className="text-right">
                      {theme && <div className="text-sm opacity-75">Theme: {theme}</div>}
                      {scenario && <div className="text-sm opacity-75">Scenario: {scenario}</div>}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6">
            <Input
              id="chatId"
              type="text"
              label="Chat ID (UUID)"
              placeholder="Enter chat ID (UUID format)"
              value={chatIdInput}
              onChange={(e) => setChatIdInput(e.target.value)}
              error={chatIdInput && !isUuid(chatIdInput) ? 'Please enter a valid UUID format' : undefined}
            />

                <div className="border border-gray-200 rounded-lg mb-4 bg-gray-50 overflow-y-auto" style={{ height: '400px' }}>
                  <div className="p-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <div className="mb-3">
                          <svg className="mx-auto w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <p>No messages yet. Start a conversation!</p>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-3">
                        {messages.map((message, idx) => (
                          <div
                            key={idx}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`px-3 py-2 rounded-lg max-w-[70%] ${
                                message.role === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-900 border border-gray-200'
                              }`}
                            >
                              <div className="text-sm">{message.text}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
