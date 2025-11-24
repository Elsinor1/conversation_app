import { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { postChatMessage, getChatMessages, getVocabularyWords, getUserLanguageLevels, getThemeById, getScenarioById, type VocabularyWord, type LanguageLevel, type JSONAPITheme, type Scenario } from '../api'
import VocabularySidebar from './VocabularySidebar'
import ScenarioInfoSidebar from './ScenarioInfoSidebar'

type Message = { role: 'assistant' | 'user'; text: string }

// Module-level cache to persist across component remounts (for React StrictMode)
const fetchCache = {
  messages: new Set<string>(), // Track which chatIds have fetched messages
  vocab: new Set<string>(), // Track which tokens have fetched vocab
}

interface SpeechPracticeChatProps {
  token: string
}

interface LocationState {
  chatId?: string
  theme?: JSONAPITheme // Full theme object from previous page
  scenario?: Scenario // Full scenario object from previous page
  themeId?: string // Theme ID for fallback
  scenarioId?: string // Scenario ID for fallback
  languageLevel?: string
}

export default function SpeechPracticeChat({ token }: SpeechPracticeChatProps) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const state = location.state as LocationState | null
  
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([])
  const [languageLevels, setLanguageLevels] = useState<LanguageLevel[]>([])
  const [vocabLoading, setVocabLoading] = useState(true)
  const [themeData, setThemeData] = useState<JSONAPITheme | null>(state?.theme || null)
  const [scenarioData, setScenarioData] = useState<Scenario | null>(state?.scenario || null)
  const [dataLoading, setDataLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const hasFetchedInitialMessage = useRef(false)
  const hasFetchedVocab = useRef(false)
  const hasFetchedMessages = useRef(false)
  
  // Get IDs from state (preferred) or URL params (fallback)
  const chatId = state?.chatId || searchParams.get('chat-id') || null
  const themeId = state?.themeId || state?.theme?.id || searchParams.get('theme') || null
  const scenarioId = state?.scenarioId || state?.scenario?.id || searchParams.get('scenario') || null
  const languageLevel = state?.languageLevel || searchParams.get('language-level') || null
  
  // Sync theme and scenario data from state when location changes
  useEffect(() => {
    if (state?.theme) {
      setThemeData(state.theme)
    }
    if (state?.scenario) {
      setScenarioData(state.scenario)
    }
  }, [state?.theme, state?.scenario])

  // Use theme/scenario from state if available, otherwise use fetched data
  const theme = themeData
  const scenario = scenarioData

  // Fetch theme and scenario from API if not in memory (from URL params)
  useEffect(() => {
    const fetchThemeAndScenario = async () => {
      if (!token || (!themeId && !scenarioId)) return
      
      // If we already have data from state, don't fetch
      if (state?.theme && state?.scenario) return
      
      try {
        setDataLoading(true)
        const promises: Promise<any>[] = []
        
        // Fetch theme if we have themeId but no theme data
        if (themeId && !themeData) {
          promises.push(getThemeById(token, themeId).then(data => setThemeData(data)))
        }
        
        // Fetch scenario if we have scenarioId but no scenario data
        if (scenarioId && !scenarioData) {
          promises.push(getScenarioById(token, scenarioId).then(data => setScenarioData(data)))
        }
        
        await Promise.all(promises)
      } catch (err) {
        console.error('Error fetching theme/scenario data:', err)
      } finally {
        setDataLoading(false)
      }
    }

    fetchThemeAndScenario()
  }, [token, themeId, scenarioId])

  // Fetch vocabulary words and language levels (only once per token)
  useEffect(() => {
    const fetchVocabData = async () => {
      if (!token || fetchCache.vocab.has(token)) {
        console.log('[SpeechPracticeChat] Skipping vocab fetch:', { noToken: !token, alreadyCached: fetchCache.vocab.has(token) })
        return
      }
      
      fetchCache.vocab.add(token)
      hasFetchedVocab.current = true
      try {
        setVocabLoading(true)
        console.log('[SpeechPracticeChat] Fetching vocab data')
        const [words, levels] = await Promise.all([
          getVocabularyWords(token),
          getUserLanguageLevels(token)
        ])
        setVocabularyWords(Array.isArray(words) ? words : [])
        setLanguageLevels(Array.isArray(levels) ? levels : [])
        console.log('[SpeechPracticeChat] Vocab data fetched:', { wordsCount: words.length, levelsCount: levels.length })
      } catch (err) {
        console.error('[SpeechPracticeChat] Error fetching vocabulary data:', err)
        fetchCache.vocab.delete(token) // Remove from cache on error to allow retry
        hasFetchedVocab.current = false
      } finally {
        setVocabLoading(false)
      }
    }

    fetchVocabData()
  }, [token])

  // Reset messages and fetch flags when chatId changes
  useEffect(() => {
    if (chatId) {
      const cacheKey = `${token}:${chatId}`
      console.log('[SpeechPracticeChat] ChatId changed, resetting state', { chatId, cacheKey })
      setMessages([])
      hasFetchedInitialMessage.current = false
      hasFetchedMessages.current = false
      // Clear cache entry for this chatId to allow fresh fetch
      fetchCache.messages.delete(cacheKey)
    }
  }, [chatId, token])

  // Fetch existing messages when chat loads (only once per chatId)
  useEffect(() => {
    let isCancelled = false
    const cacheKey = `${token}:${chatId}`
    
    const fetchMessages = async () => {
      console.log('[SpeechPracticeChat] fetchMessages effect triggered:', { 
        token: token ? 'present' : 'missing', 
        chatId, 
        cacheKey,
        hasFetchedMessages: hasFetchedMessages.current,
        hasFetchedInitial: hasFetchedInitialMessage.current,
        messagesCount: messages.length,
        inCache: fetchCache.messages.has(cacheKey)
      })
      
      if (!token || !chatId || fetchCache.messages.has(cacheKey) || hasFetchedMessages.current || messages.length > 0) {
        console.log('[SpeechPracticeChat] Skipping fetch:', { 
          noToken: !token, 
          noChatId: !chatId, 
          inCache: fetchCache.messages.has(cacheKey),
          alreadyFetched: hasFetchedMessages.current,
          hasMessages: messages.length > 0
        })
        return
      }
      
      fetchCache.messages.add(cacheKey)
      hasFetchedMessages.current = true
      
      try {
        setIsLoading(true)
        console.log('[SpeechPracticeChat] Fetching existing messages for chat:', chatId)
        const existingMessages = await getChatMessages(token, chatId)
        
        if (isCancelled) {
          console.log('[SpeechPracticeChat] Fetch cancelled, ignoring results')
          return
        }
        
        console.log('[SpeechPracticeChat] Received messages:', existingMessages)
        
        if (existingMessages.length > 0) {
          // Chat has existing messages, load them
          console.log('[SpeechPracticeChat] Loading existing messages:', existingMessages.length)
          setMessages(existingMessages)
          hasFetchedInitialMessage.current = true
        } else {
          // No existing messages, fetch initial message
          console.log('[SpeechPracticeChat] No existing messages, fetching initial message')
          try {
            hasFetchedInitialMessage.current = true
            const text = await postChatMessage({ token, chatId, message: undefined })
            
            if (isCancelled) {
              console.log('[SpeechPracticeChat] Initial message fetch cancelled, ignoring results')
              return
            }
            
            console.log('[SpeechPracticeChat] Initial message received:', text)
            setMessages([{ role: 'assistant', text }])
          } catch (initErr: any) {
            if (isCancelled) {
              console.log('[SpeechPracticeChat] Initial message fetch cancelled, ignoring error')
              return
            }
            console.error('[SpeechPracticeChat] Error fetching initial message:', initErr)
            // Don't remove from cache here - we tried to fetch, just failed
            setMessages([
              { role: 'assistant', text: `Error: ${initErr?.message || 'Failed to start conversation'}` },
            ])
          }
        }
      } catch (err: any) {
        if (isCancelled) {
          console.log('[SpeechPracticeChat] Fetch cancelled, ignoring error')
          return
        }
        
        console.error('[SpeechPracticeChat] Error fetching messages:', err)
        fetchCache.messages.delete(cacheKey) // Remove from cache on error to allow retry
        hasFetchedMessages.current = false
        
        // If fetching messages fails, try to start a new conversation
        // But only if it's a 404 (chat not found) or similar, not if chat already started
        if (err?.message?.includes('404') || err?.message?.includes('not found')) {
          try {
            console.log('[SpeechPracticeChat] Attempting to start new conversation')
            hasFetchedInitialMessage.current = true
            hasFetchedMessages.current = true
            const text = await postChatMessage({ token, chatId, message: undefined })
            
            if (isCancelled) {
              console.log('[SpeechPracticeChat] Start conversation cancelled, ignoring results')
              return
            }
            
            setMessages([{ role: 'assistant', text }])
          } catch (startErr: any) {
            if (isCancelled) return
            console.error('[SpeechPracticeChat] Error starting conversation:', startErr)
            setMessages([
              { role: 'assistant', text: `Error: ${startErr?.message || err?.message || 'Failed to load conversation'}` },
            ])
          }
        } else {
          // For other errors, show error message
          setMessages([
            { role: 'assistant', text: `Error: ${err?.message || 'Failed to load conversation'}` },
          ])
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchMessages()
    
    // Cleanup function to cancel in-flight requests
    return () => {
      isCancelled = true
      console.log('[SpeechPracticeChat] Cleanup: cancelling fetchMessages')
    }
  }, [token, chatId])

  // Filter vocabulary words by theme and language level
  const filteredVocabularyWords = useMemo(() => {
    return vocabularyWords.filter(word => {
      // Filter by theme (use themeId if theme object not available)
      const currentThemeId = theme?.id || themeId
      if (currentThemeId) {
        const hasMatchingTheme = word.theme.some(t => String(t.id) === String(currentThemeId))
        if (!hasMatchingTheme) {
          return false
        }
      }
      
      // Filter by language level if available
      if (languageLevel && languageLevels.length > 0) {
        const selectedLangLevel = languageLevels.find(ll => ll.id.toString() === languageLevel)
        if (selectedLangLevel && word.level.id !== selectedLangLevel.level.id) {
          return false
        }
      }
      
      return true
    })
  }, [vocabularyWords, theme, themeId, languageLevel, languageLevels])

  const canSend = useMemo(() => {
    return !!token && !!chatId && !isLoading
  }, [token, chatId, isLoading])

  const send = useCallback(async () => {
    if (!canSend || !chatId) return
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
  }, [canSend, chatId, input, token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 ml-18 relative">
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-secondary to-tertiary text-white px-6 py-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-xl font-semibold">{scenario?.title || 'Chat Interface'}</h1>
                </div>
              </div>
              
              <div className="p-6">
                {!chatId ? (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <svg className="mx-auto w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Chat Session</h3>
                    <p className="text-gray-600 mb-4">Please start a practice session from the setup page.</p>
                    <button
                      onClick={() => window.location.href = '/practice-setup'}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Practice Setup
                    </button>
                  </div>
                ) : (
                  <>
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
                        placeholder="Start conversation here..."
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Information Sidebar - Left */}
      <ScenarioInfoSidebar
        scenarioId={scenario?.id || scenarioId || ''}
        theme={theme?.id || themeId || ''}
      />

      {/* Vocabulary Words Sidebar - Right */}
      <VocabularySidebar
        vocabularyWords={filteredVocabularyWords}
        selectedLanguageLevel={languageLevel || ''}
        selectedTheme={theme?.id || themeId || ''}
        isLoading={vocabLoading || dataLoading}
      />
    </div>
  )
}
