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

export type Theme = {
  id: string
  attributes: {
    title: string
    description: string
  }
}

export type Scenario = {
  id: string
  attributes: {
    title: string
    description: string
  }
}

export async function getThemes(token: string): Promise<{data: Theme[]}> {
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
  return response.json()
}

export async function getScenarios(token: string): Promise<{data: Scenario[]}> {
  const response = await fetch('/api/scenario/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Failed to fetch scenarios (${response.status}): ${text || response.statusText}`)
  }
  return response.json()
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


