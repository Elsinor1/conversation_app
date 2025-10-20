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
  return response.json()
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
export type LanguageLevel = {
  id: number
  language: {
    id: number
    name: string
  }
  level: {
    id: number
    ABC_value: string
    name: string
  }
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
export type Language = {
  id: number
  name: string
}

export type Level = {
  id: number
  ABC_value: string
  name: string
}

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

export async function createLanguageLevel(token: string, languageId: number, levelId: number): Promise<LanguageLevel> {
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
  language: {
    id: number
    name: string
  }
  level: {
    id: number
    ABC_value: string
    name: string
  }
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


