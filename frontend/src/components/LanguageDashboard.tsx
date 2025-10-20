import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLanguageStats, type LanguageStats } from '../api'
import { 
  FaArrowLeft, 
  FaBookOpen, 
  FaMicrophone, 
  FaClock, 
  FaChartLine,
  FaGraduationCap
} from 'react-icons/fa'

interface LanguageDashboardProps {
  token: string
}

export default function LanguageDashboard({ token }: LanguageDashboardProps) {
  const navigate = useNavigate()
  const { languageName } = useParams<{ languageName: string }>()
  const [stats, setStats] = useState<LanguageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLanguageStats = async () => {
      if (!languageName) return
      
      try {
        setIsLoading(true)
        setError('')
        
        const decodedLanguageName = decodeURIComponent(languageName)
        const response = await getLanguageStats(token, decodedLanguageName)
        setStats(response)
      } catch (err: any) {
        console.error('Error fetching language stats:', err)
        setError(err?.message || 'Failed to load language data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLanguageStats()
  }, [token, languageName])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A1': return 'bg-green-100 text-green-800'
      case 'A2': return 'bg-blue-100 text-blue-800'
      case 'B1': return 'bg-yellow-100 text-yellow-800'
      case 'B2': return 'bg-orange-100 text-orange-800'
      case 'C1': return 'bg-red-100 text-red-800'
      case 'C2': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFlagEmoji = (languageName: string) => {
    const flagMap: { [key: string]: string } = {
      'Spanish': '🇪🇸',
      'French': '🇫🇷',
      'German': '🇩🇪',
      'Italian': '🇮🇹',
      'Portuguese': '🇵🇹',
      'Russian': '🇷🇺',
      'Chinese': '🇨🇳',
      'Japanese': '🇯🇵',
      'Korean': '🇰🇷',
      'Arabic': '🇸🇦',
      'English': '🇺🇸',
      'Dutch': '🇳🇱',
      'Swedish': '🇸🇪',
      'Norwegian': '🇳🇴',
      'Danish': '🇩🇰',
      'Finnish': '🇫🇮',
      'Polish': '🇵🇱',
      'Czech': '🇨🇿',
      'Hungarian': '🇭🇺',
      'Greek': '🇬🇷',
      'Turkish': '🇹🇷',
      'Hebrew': '🇮🇱',
      'Hindi': '🇮🇳',
      'Thai': '🇹🇭',
      'Vietnamese': '🇻🇳',
      'Indonesian': '🇮🇩',
      'Malay': '🇲🇾',
      'Tagalog': '🇵🇭',
      'Swahili': '🇰🇪',
      'Zulu': '🇿🇦',
      'Afrikaans': '🇿🇦',
      'Ukrainian': '🇺🇦',
      'Romanian': '🇷🇴',
      'Bulgarian': '🇧🇬',
      'Croatian': '🇭🇷',
      'Serbian': '🇷🇸',
      'Slovak': '🇸🇰',
      'Slovenian': '🇸🇮',
      'Estonian': '🇪🇪',
      'Latvian': '🇱🇻',
      'Lithuanian': '🇱🇹',
      'Icelandic': '🇮🇸',
      'Irish': '🇮🇪',
      'Welsh': '🇬🇧',
      'Scottish Gaelic': '🇬🇧',
      'Catalan': '🇪🇸',
      'Basque': '🇪🇸',
      'Galician': '🇪🇸',
      'Brazilian Portuguese': '🇧🇷',
      'Mexican Spanish': '🇲🇽',
      'Argentinian Spanish': '🇦🇷',
      'Canadian French': '🇨🇦',
      'Swiss German': '🇨🇭',
      'Austrian German': '🇦🇹',
      'Belgian Dutch': '🇧🇪',
      'South African English': '🇿🇦',
      'Australian English': '🇦🇺',
      'New Zealand English': '🇳🇿',
      'Canadian English': '🇨🇦',
      'British English': '🇬🇧',
      'American English': '🇺🇸'
    }
    return flagMap[languageName] || '🌍'
  }

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 ml-18">
        <div className="max-w-7xl mx-auto px-3">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading language dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 ml-18">
        <div className="max-w-7xl mx-auto px-3">
          <div className="bg-red-50 border border-red-200 rounded-md p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  <strong>Error:</strong> {error}
                </h3>
                <button 
                  className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 ml-18">
        <div className="max-w-7xl mx-auto px-3">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Language Not Found</h1>
            <p className="text-gray-600 mb-6">The requested language could not be found.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 ml-18">
      <div className="max-w-7xl mx-auto px-3">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <FaArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center mb-4">
            <div className="text-4xl mr-4">{getFlagEmoji(stats.language.name)}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{stats.language.name}</h1>
              <div className="flex items-center mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(stats.level.ABC_value)}`}>
                  {stats.level.ABC_value}
                </span>
                <span className="ml-3 text-gray-600">{stats.level.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <FaChartLine className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Overall Progress</h2>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Level Progress</span>
              <span>{stats.progress}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${stats.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Practice Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Vocabulary Practices */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaBookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Vocabulary Practices</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.vocabularyPractices}</p>
              </div>
            </div>
          </div>

          {/* Speech Practices */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaMicrophone className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Speech Practices</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.speechPractices}</p>
              </div>
            </div>
          </div>

          {/* Vocabulary Words */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaGraduationCap className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Vocabulary Words</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.vocabularyWords}</p>
              </div>
            </div>
          </div>

          {/* Study Time */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaClock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Study Time</p>
                <p className="text-2xl font-semibold text-gray-900">{formatStudyTime(stats.totalStudyTime)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Progress Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vocabulary Progress */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <FaBookOpen className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Vocabulary Progress</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Practices Completed</span>
                  <span>{stats.vocabularyPractices}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((stats.vocabularyPractices / 50) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: 50 practices</p>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Words Learned</span>
                  <span>{stats.vocabularyWords}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-orange-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((stats.vocabularyWords / 200) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: 200 words</p>
              </div>
            </div>
          </div>

          {/* Speech Progress */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <FaMicrophone className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Speech Progress</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Speech Practices</span>
                  <span>{stats.speechPractices}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((stats.speechPractices / 30) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: 30 practices</p>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Study Time</span>
                  <span>{formatStudyTime(stats.totalStudyTime)}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((stats.totalStudyTime / 300) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: 5 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FaBookOpen className="h-5 w-5 text-purple-600 mr-3" />
              <span className="font-medium">Practice Vocabulary</span>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FaMicrophone className="h-5 w-5 text-green-600 mr-3" />
              <span className="font-medium">Speech Practice</span>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FaGraduationCap className="h-5 w-5 text-blue-600 mr-3" />
              <span className="font-medium">Start Conversation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}