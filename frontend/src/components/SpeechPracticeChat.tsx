import { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { postChatMessage, getChatMessageHistory, getVocabularyWords, getUserLanguageLevels, getThemeById, getScenarioById, speechToText, getVoiceSample, type VocabularyWord, type LanguageLevel, type JSONAPITheme, type Scenario } from '../api'
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
  const params = useParams<{ chatId: string }>()
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
  const [isRecording, setIsRecording] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const hasFetchedInitialMessage = useRef(false)
  const hasFetchedVocab = useRef(false)
  const hasFetchedMessages = useRef(false)
  
  // Get chatId from URL params (primary) or state/searchParams (fallback)
  const chatId = params.chatId || state?.chatId || searchParams.get('chat-id') || null
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
      // Clear cache entry for this chatId to allow fresh fetch on refresh
      fetchCache.messages.delete(cacheKey)
    }
  }, [chatId, token])

  // Fetch existing messages when chat loads
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
      
      // Don't fetch if we don't have token or chatId
      if (!token || !chatId) {
        console.log('[SpeechPracticeChat] Skipping fetch: missing token or chatId')
        return
      }
      
      // Always fetch if messages array is empty (handles page refresh)
      // Only skip if messages already exist in state (prevents duplicate fetches during React StrictMode)
      if (messages.length > 0) {
        console.log('[SpeechPracticeChat] Skipping fetch: messages already exist in state', messages.length)
        return
      }
      
      // Mark as fetching to prevent duplicate calls
      hasFetchedMessages.current = true
      fetchCache.messages.add(cacheKey)
      
      try {
        setIsLoading(true)
        console.log('[SpeechPracticeChat] Fetching existing messages for chat:', chatId)
        const existingMessages = await getChatMessageHistory(token, chatId)
        
        if (isCancelled) {
          console.log('[SpeechPracticeChat] Fetch cancelled, ignoring results')
          return
        }
        
        console.log('[SpeechPracticeChat] Received messages:', existingMessages)
        console.log('[SpeechPracticeChat] Messages type:', typeof existingMessages, 'isArray:', Array.isArray(existingMessages))
        console.log('[SpeechPracticeChat] Messages length:', existingMessages?.length)
        
        if (existingMessages && Array.isArray(existingMessages) && existingMessages.length > 0) {
          // Chat has existing messages, load them
          console.log('[SpeechPracticeChat] Loading existing messages:', existingMessages.length)
          console.log('[SpeechPracticeChat] First message sample:', existingMessages[0])
          setMessages(existingMessages)
          hasFetchedInitialMessage.current = true
          console.log('[SpeechPracticeChat] Messages state set successfully')
        } else {
          // No existing messages, try to fetch initial message (only if chat hasn't started)
          console.log('[SpeechPracticeChat] No existing messages, attempting to start conversation')
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
            
            // Check if error indicates chat is already started
            const errorMessage = initErr?.message || ''
            if (errorMessage.includes('already started') || errorMessage.includes('message is then mandatory')) {
              // Chat is already started but has no messages - this shouldn't happen normally
              // but handle it gracefully by showing empty state
              console.log('[SpeechPracticeChat] Chat already started but no messages found')
              setMessages([])
            } else {
              // Other error - show error message
            setMessages([
              { role: 'assistant', text: `Error: ${initErr?.message || 'Failed to start conversation'}` },
            ])
            }
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
        // But only if it's a 404 (chat not found) or similar, NOT if chat already started
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
            
            // Check if error indicates chat is already started
            const startErrorMessage = startErr?.message || ''
            if (startErrorMessage.includes('already started') || startErrorMessage.includes('message is then mandatory')) {
              // Chat is already started - try to fetch messages again or show empty state
              console.log('[SpeechPracticeChat] Chat already started, showing empty state')
              setMessages([])
            } else {
              // Other error - show error message
            setMessages([
              { role: 'assistant', text: `Error: ${startErr?.message || err?.message || 'Failed to load conversation'}` },
            ])
            }
          }
        } else {
          // For other errors (not 404), show error message
          // Don't try to start conversation if it's not a 404 error
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

  // Helper function to map language name to Azure speech recognition language code
  const getSpeechLanguageCode = useCallback((): string => {
    if (!languageLevel || languageLevels.length === 0) {
      return 'en-US' // Default to English
    }
    
    const selectedLangLevel = languageLevels.find(ll => ll.id.toString() === languageLevel)
    if (!selectedLangLevel?.language?.name) {
      return 'en-US' // Default to English if no language found
    }
    
    const languageName = selectedLangLevel.language.name.toLowerCase()
    
    // Map language names to Azure speech recognition codes
    const languageMap: Record<string, string> = {
      'english': 'en-US',
      'spanish': 'es-ES',
      'french': 'fr-FR',
      'german': 'de-DE',
      'italian': 'it-IT',
      'portuguese': 'pt-BR',
      'japanese': 'ja-JP',
      'chinese': 'zh-CN',
      'chinese (simplified)': 'zh-CN',
      'chinese (traditional)': 'zh-TW',
      'czech': 'cs-CZ',
    }
    
    return languageMap[languageName] || 'en-US' // Default to English if mapping not found
  }, [languageLevel, languageLevels])

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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }, [messages])

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

  const startRecording = useCallback(async () => {
    try {
      // Check if MediaRecorder is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaRecorder API is not supported in this browser')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Try to find a supported mime type
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Try alternatives
        const alternatives = [
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/mp4',
          'audio/wav'
        ]
        mimeType = alternatives.find(type => MediaRecorder.isTypeSupported(type)) || ''
      }
      
      const options = mimeType ? { mimeType } : undefined
      const mediaRecorder = new MediaRecorder(stream, options)
      
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
        
        // Convert webm to wav format
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        
        // Convert to WAV format
        try {
          const audioContext = new AudioContext()
          const arrayBuffer = await audioBlob.arrayBuffer()
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          
          // Convert AudioBuffer to WAV
          const wavBlob = audioBufferToWav(audioBuffer)
          
          // Send to speech recognition API
          setIsLoading(true)
          const speechLanguage = getSpeechLanguageCode()
          const recognizedText = await speechToText({ 
            token, 
            audio: wavBlob,
            language: speechLanguage
          })
          
          console.log('Recognized text:', recognizedText, 'Type:', typeof recognizedText)
          
          // Set the recognized text as input and send it
          if (recognizedText && typeof recognizedText === 'string') {
            setInput(recognizedText)
            // Automatically send the message
            const trimmedText = recognizedText.trim()
            if (trimmedText && chatId) {
              setMessages((prev) => [...prev, { role: 'user', text: trimmedText }])
              const text = await postChatMessage({ token, chatId, message: trimmedText })
              setMessages((prev) => [...prev, { role: 'assistant', text }])
            }
          } else {
            throw new Error(`Invalid response from speech recognition: ${recognizedText}`)
          }
        } catch (err: any) {
          console.error('Error processing audio:', err)
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', text: `Error: ${err?.message || 'Failed to recognize speech'}` },
          ])
        } finally {
          setIsLoading(false)
          setIsRecording(false)
          inputRef.current?.focus()
        }
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err: any) {
      console.error('Error starting recording:', err)
      alert(`Failed to access microphone: ${err?.message || 'Unknown error'}`)
    }
  }, [token, chatId, getSpeechLanguageCode])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  const testWithSample = useCallback(async () => {
    if (!canSend || !chatId) return
    
    try {
      setIsLoading(true)
      // Fetch the sample audio file
      const audioBlob = await getVoiceSample(token)
      
      // Send to speech recognition API
      const speechLanguage = getSpeechLanguageCode()
      const recognizedText = await speechToText({ 
        token, 
        audio: audioBlob,
        language: speechLanguage
      })
      
      console.log('Recognized text (sample):', recognizedText, 'Type:', typeof recognizedText)
      
      // Set the recognized text as input and send it
      if (recognizedText && typeof recognizedText === 'string') {
        setInput(recognizedText)
        // Automatically send the message
        const trimmedText = recognizedText.trim()
        if (trimmedText && chatId) {
          setMessages((prev) => [...prev, { role: 'user', text: trimmedText }])
          const text = await postChatMessage({ token, chatId, message: trimmedText })
          setMessages((prev) => [...prev, { role: 'assistant', text }])
        }
      } else {
        throw new Error(`Invalid response from speech recognition: ${recognizedText}`)
      }
    } catch (err: any) {
      console.error('Error testing with sample:', err)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Error: ${err?.message || 'Failed to process sample audio'}` },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }, [canSend, chatId, token, getSpeechLanguageCode])

  // Helper function to convert AudioBuffer to WAV Blob
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length
    const numberOfChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2)
    const view = new DataView(arrayBuffer)
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length * numberOfChannels * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numberOfChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * numberOfChannels * 2, true)
    view.setUint16(32, numberOfChannels * 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, length * numberOfChannels * 2, true)
    
    // Convert float samples to 16-bit PCM
    let offset = 44
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]))
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
        offset += 2
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }

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
                    <div 
                      ref={messagesContainerRef}
                      className="border border-gray-200 rounded-lg mb-4 bg-gray-50 overflow-y-auto" 
                      style={{ height: '400px' }}
                    >
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
                            <div ref={messagesEndRef} />
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
                        disabled={!canSend || isLoading}
                        onClick={toggleRecording}
                        className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isRecording
                            ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                            : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                        }`}
                        type="button"
                        title={isRecording ? 'Stop recording' : 'Start voice input'}
                      >
                        {isRecording ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                          </svg>
                        )}
                      </button>
                      <button
                        disabled={!canSend || isLoading}
                        onClick={testWithSample}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                        title="Test with sample audio file"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </button>
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
