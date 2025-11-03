import { getStoredToken } from './auth'
export type PostChatMessageParams = {
  token: string;
  chatId: string; // UUID
  message?: string;
};

export async function postChatMessage({ token, chatId, message }: PostChatMessageParams): Promise<string> {
  const effectiveToken = token || getStoredToken() || ''
  const response = await fetch('/api/chat_message/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${effectiveToken}`,
    },
    body: JSON.stringify({ chat_id: chatId, message }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Request failed (${response.status}): ${text || response.statusText}`);
  }

  // Endpoint returns plain message string
  const data = await response.text();
  return data;
}

export type CreateChatParams = {
  token: string
  theme: string
  scenario: string
  language_level: string
}

export type ChatResponse = {
  id: string
  theme: string
  scenario: string
  language_level: string
  created_at: string
  updated_at: string
}

export async function createChat({ token, theme, scenario, language_level }: CreateChatParams): Promise<ChatResponse> {
  const effectiveToken = token || getStoredToken() || ''
  const response = await fetch('/api/chat/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${effectiveToken}`,
    },
    body: JSON.stringify({ theme, scenario, language_level }),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Failed to create chat (${response.status}): ${text || response.statusText}`)
  }
  return response.json()
}

export async function getUserLanguageLevels(token: string): Promise<LanguageLevel[]> {
  const effectiveToken = token || getStoredToken() || ''
  const response = await fetch('/api/language_level/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${effectiveToken}`,
    },
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Failed to fetch language levels (${response.status}): ${text || response.statusText}`)
  }
  const data = await response.json()
  console.log('Language levels API response:', data)
  
  // Handle API response that may be wrapped in {data: [...]}
  let levelsArray = Array.isArray(data) ? data : (data?.data || [])
  
  // Normalize JSON:API format if needed: {type: 'LanguageLevel', id: 'uuid', attributes: {...}}
  // to {id: number, language: {id, name}, level: {id, ABC_value, name}, progress: number}
  levelsArray = levelsArray.map((level: any) => {
    if (level.attributes) {
      // JSON:API format - normalize it
      const attrs = level.attributes
      return {
        id: level.id,
        language: attrs.language || (attrs.language_id ? { id: attrs.language_id, name: attrs.language_name } : null),
        level: attrs.level || (attrs.level_id ? { id: attrs.level_id, ABC_value: attrs.level_abc, name: attrs.level_name } : null),
        progress: attrs.progress || 0
      }
    }
    // Already in expected format
    return level
  })
  
  return levelsArray
}

export type LoginParams = { username: string; password: string }
export type LoginResponse = { token: string }

export async function login({ username, password }: LoginParams): Promise<LoginResponse> {
  const response = await fetch('/api/api-token-auth/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Login failed (${response.status}): ${text || response.statusText}`)
  }
  return response.json()
}

export type RegisterParams = { username: string; password: string; email?: string }
export type RegisterResponse = { token: string; user: { id: number; username: string; email: string } }

export async function register({ username, password, email }: RegisterParams): Promise<RegisterResponse> {
  const response = await fetch('/api/register/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email }),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Registration failed (${response.status}): ${text || response.statusText}`)
  }
  return response.json()
}

export type Scenario = {
  id: string
  title: string
  description: string
  teacher_role: string
  student_role: string
}

export type Theme = {
  id: string
  title: string
  description: string
  scenarios: Scenario[]
}

// Theme format types (plain objects, not JSON API)
export type JSONAPITheme = {
  id: string
  title: string
  description: string
  scenarios: Scenario[]
}

export async function getPracticeSetupData(token: string): Promise<{themes: JSONAPITheme[], language_levels: LanguageLevel[]}> {
  console.log('Making API call to /api/practice-setup/ with token:', token ? 'present' : 'missing')
  const response = await fetch('/api/practice-setup/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
  })
  console.log('API response status:', response.status)
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    console.error('API error:', response.status, text)
    throw new Error(`Failed to fetch practice setup data (${response.status}): ${text || response.statusText}`)
  }
  const data = await response.json()
  console.log('API response data:', data)
  return data
}

// Dashboard API types
export type Language = {
  id: string
  name: string
}

export type Level = {
  id: string
  ABC_value: string
  name: string
}

export type LanguageLevel = {
  id: string
  language: Language
  level: Level
  progress?: number
}

export type DashboardStats = {
  languages: LanguageLevel[]
  totalChats: number
  completedChats: number
  vocabularyPractices: number
  totalStudyTime: number // in minutes
}

export async function getDashboardStats(token: string): Promise<{data: DashboardStats}> {
  const response = await fetch('/api/dashboard-stats/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Failed to fetch dashboard stats (${response.status}): ${text || response.statusText}`)
  }
  return response.json()
}

// Language and Level API types

export async function getLanguages(token: string): Promise<Language[]> {
  const response = await fetch('/api/languages/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Failed to fetch languages (${response.status}): ${text || response.statusText}`)
  }
  const response_data = await response.json()
  console.log('Languages API response:', response_data)
  // Extract data from response structure
  return response_data.data || response_data
}

export async function getLevels(token: string): Promise<Level[]> {
  const response = await fetch('/api/levels/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Failed to fetch levels (${response.status}): ${text || response.statusText}`)
  }
  const response_data = await response.json()
  console.log('Levels API response:', response_data)
  // Extract data from response structure
  return response_data.data || response_data
}

export async function createLanguageLevel(token: string, languageId: string, levelId: string): Promise<LanguageLevel> {
  const response = await fetch('/api/language_level/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({
      language: languageId,
      level: levelId
    }),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Failed to create language level (${response.status}): ${text || response.statusText}`)
  }
  return response.json()
}

// Language-specific stats types
export type LanguageStats = {
  language: Language
  level: Level
  vocabularyPractices: number
  speechPractices: number
  vocabularyWords: number
  totalStudyTime: number // in minutes
  progress: number
}

export async function getLanguageStats(token: string, languageName: string): Promise<LanguageStats> {
  const encodedLanguageName = encodeURIComponent(languageName)
  const response = await fetch(`/api/language-stats/${encodedLanguageName}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Failed to fetch language stats (${response.status}): ${text || response.statusText}`)
  }
  return response.json()
}

// Vocabulary API types
export type VocabularyWord = {
  id: number
  word: string
  german_translation: string
  czech_translation: string
  level: {
    id: number
    ABC_value: string
    name: string
  }
  theme: Array<{
    id: number
    title: string
    description: string
  }>
}

export type UserVocabularyWord = {
  id: number
  user: number
  vocabulary_word: VocabularyWord
  learning_status: 'not_learned' | 'in_progress' | 'learned'
  created: string
  modified: string
}

export type VocabularyTheme = {
  id: string | number  // Can be UUID string or number
  title: string
  description: string
}

// Vocabulary API functions
export async function getVocabularyWords(token: string): Promise<VocabularyWord[]> {
  const response = await fetch('/api/vocabulary-words/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Failed to fetch vocabulary words (${response.status}): ${text || response.statusText}`)
  }
  const data = await response.json()
  console.log('Vocabulary words API response:', data)
  
  // Handle API response that may be wrapped in {data: [...]}
  let wordsArray = Array.isArray(data) ? data : (data?.data || [])
  
  // Normalize JSON:API format: {type: 'VocabularyWord', id: 'uuid', attributes: {...}}
  // to {id: number, word: string, german_translation: string, czech_translation: string, level: {...}, theme: [...]}
  wordsArray = wordsArray.map((word: any) => {
    if (word.attributes) {
      // JSON:API format - normalize it
      return {
        id: word.id,
        word: word.attributes.word,
        german_translation: word.attributes.german_translation,
        czech_translation: word.attributes.czech_translation,
        level: word.attributes.level,
        theme: word.attributes.theme || []
      }
    }
    // Already in expected format
    return word
  })
  
  return wordsArray
}

export async function getUserVocabularyWords(token: string): Promise<UserVocabularyWord[]> {
  const response = await fetch('/api/user-vocabulary-status/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Failed to fetch user vocabulary words (${response.status}): ${text || response.statusText}`)
  }
  return response.json().data
}

export async function updateUserVocabularyWordStatus(
  token: string, 
  userVocabularyWordId: number, 
  learningStatus: 'not_learned' | 'in_progress' | 'learned'
): Promise<UserVocabularyWord> {
  const response = await fetch(`/api/user-vocabulary-status/${userVocabularyWordId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({ learning_status: learningStatus }),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Failed to update vocabulary word status (${response.status}): ${text || response.statusText}`)
  }
  return response.json().data
}

export async function createUserVocabularyWordStatus(
  token: string, 
  vocabularyWordId: number, 
  learningStatus: 'not_learned' | 'in_progress' | 'learned' = 'not_learned'
): Promise<UserVocabularyWord> {
  const response = await fetch('/api/user-vocabulary-status/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({ 
      vocabulary_word_id: vocabularyWordId,
      learning_status: learningStatus 
    }),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Failed to create vocabulary word status (${response.status}): ${text || response.statusText}`)
  }
  return response.json().data
}

export async function getThemes(token: string): Promise<VocabularyTheme[]> {
  const response = await fetch('/api/theme/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Failed to fetch themes (${response.status}): ${text || response.statusText}`)
  }
  const data = await response.json()
  console.log('Themes API response:', typeof data.data, data)
  
  return data.data
}


