import { useState, useEffect } from 'react'
import { getDashboardStats, type DashboardStats } from '../api'
import LanguageSelector from './LanguageSelector'
import { 
  FaLanguage, 
  FaComments, 
  FaBookOpen, 
  FaClock, 
  FaTrophy,
  FaChartLine,
  FaGraduationCap
} from 'react-icons/fa'

interface DashboardProps {
  token: string
}

export default function Dashboard({ token }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        console.log('Fetching dashboard stats with token:', token ? 'present' : 'missing')
        const response = await getDashboardStats(token)
        console.log('Dashboard stats received:', response)
        // Handle the response structure - data might be wrapped in a 'data' property
        const data = response.data || response
        setStats(data)
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err)
        setError(err?.message || 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [token])

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

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  const handleLanguageAdded = () => {
    // Refresh the dashboard data
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        console.log('Fetching dashboard stats with token:', token ? 'present' : 'missing')
        const response = await getDashboardStats(token)
        console.log('Dashboard stats received:', response)
        // Handle the response structure - data might be wrapped in a 'data' property
        const data = response.data || response
        setStats(data)
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err)
        setError(err?.message || 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 ml-18">
        <div className="max-w-7xl mx-auto px-3">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Fluentify!</h1>
            <p className="text-gray-600 mb-6">No data available yet. Start by adding a language to your profile.</p>
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Get Started</h2>
              <p className="text-gray-600 mb-4">Add your first language to begin tracking your learning progress.</p>
              <button 
                onClick={() => setShowLanguageSelector(true)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Language
              </button>
            </div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Dashboard</h1>
          <p className="text-gray-600">Track your language learning progress and achievements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Chats */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaComments className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Chats</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalChats}</p>
              </div>
            </div>
          </div>

          {/* Completed Chats */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaTrophy className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed Chats</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completedChats}</p>
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(stats.completedChats, stats.totalChats)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {getProgressPercentage(stats.completedChats, stats.totalChats)}% completion rate
                  </p>
                </div>
              </div>
            </div>
          </div>

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

          {/* Study Time */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaClock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Study Time</p>
                <p className="text-2xl font-semibold text-gray-900">{Math.round(stats.totalStudyTime / 60)}h {stats.totalStudyTime % 60}m</p>
              </div>
            </div>
          </div>
        </div>

        {/* Languages Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Learning Languages */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <FaLanguage className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Learning Languages</h2>
            </div>
            
            {stats.languages.length === 0 ? (
              <div className="text-center py-8">
                <FaGraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No languages added yet</p>
                <p className="text-sm text-gray-400 mt-2">Start learning by adding a language to your profile</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.languages.map((langLevel) => (
                  <div key={langLevel.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{langLevel.language.name}</h3>
                        <p className="text-sm text-gray-500">{langLevel.level.name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(langLevel.level.ABC_value)}`}>
                        {langLevel.level.ABC_value}
                      </span>
                    </div>
                    
                    {/* Progress bar for each language */}
                    <div className="mt-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{langLevel.level.ABC_value}</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${langLevel.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Learning Progress Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <FaChartLine className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Learning Progress</h2>
            </div>
            
            <div className="space-y-4">
              {/* Weekly Progress */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>This Week</span>
                  <span>5/7 days</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div className="bg-green-600 h-3 rounded-full" style={{ width: '71%' }}></div>
                </div>
              </div>

              {/* Monthly Progress */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>This Month</span>
                  <span>18/30 days</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>

              {/* Streak */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Current Streak</p>
                    <p className="text-2xl font-bold">7 days</p>
                  </div>
                  <FaTrophy className="h-8 w-8 opacity-80" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FaComments className="h-5 w-5 text-blue-600 mr-3" />
              <span className="font-medium">Start New Chat</span>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FaBookOpen className="h-5 w-5 text-purple-600 mr-3" />
              <span className="font-medium">Practice Vocabulary</span>
            </button>
            <button 
              onClick={() => setShowLanguageSelector(true)}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaGraduationCap className="h-5 w-5 text-green-600 mr-3" />
              <span className="font-medium">Add Language</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Language Selector Modal */}
      {showLanguageSelector && (
        <LanguageSelector
          token={token}
          onLanguageAdded={handleLanguageAdded}
          onClose={() => setShowLanguageSelector(false)}
          userLanguages={stats?.languages || []}
        />
      )}
    </div>
  )
}