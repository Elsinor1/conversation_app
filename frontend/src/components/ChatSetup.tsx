import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getThemes, getScenarios, type Theme, type Scenario } from '../api'
import Button from './Button'

interface ChatSetupProps {
  token: string
}

export default function ChatSetup({ token }: ChatSetupProps) {
  const [themes, setThemes] = useState<Theme[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selectedTheme, setSelectedTheme] = useState('')
  const [selectedScenario, setSelectedScenario] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        console.log('Fetching themes and scenarios...')
        const [themesData, scenariosData] = await Promise.all([
          getThemes(token),
          getScenarios(token)
        ])
        
        console.log('Themes data:', themesData)
        console.log('Scenarios data:', scenariosData)
        
        setThemes(themesData?.data || [])
        setScenarios(scenariosData?.data || [])
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err?.message || 'Failed to load themes and scenarios')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token])

  const handleStartChat = () => {
    if (!selectedTheme || !selectedScenario) {
      alert('Please select both a theme and scenario before starting the chat.')
      return
    }

    // Navigate to chat with theme and scenario parameters
    navigate(`/chat?theme=${selectedTheme}&scenario=${selectedScenario}`)
  }

  const selectedThemeData = themes.find(t => t.id === selectedTheme)
  const selectedScenarioData = scenarios.find(s => s.id === selectedScenario)

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg">
              <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
                <h1 className="text-xl font-semibold">Setup Your Chat Experience</h1>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Choose a theme and scenario to customize your AI conversation experience.
                </p>

                {/* Loading State */}
                {isLoading && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading themes and scenarios...</p>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4" role="alert">
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
                )}

                {/* Debug Info */}
                {!isLoading && !error && (
                  <div className="mb-3 p-2 bg-blue-50 rounded">
                    <small className="text-gray-600">
                      Debug: Themes: {themes.length}, Scenarios: {scenarios.length}
                    </small>
                  </div>
                )}

                {/* Content - only show when not loading and no error */}
                {!isLoading && !error && (
                  <>
                    {/* Theme Selection */}
                    <div className="mb-4">
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                    <strong>Select Theme</strong>
                  </label>
                  <select
                    id="theme"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                  >
                    <option value="">Choose a theme...</option>
                    {themes.map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.attributes.title}
                      </option>
                    ))}
                  </select>
                  {selectedThemeData && (
                    <div className="mt-2 p-3 bg-gray-50 rounded">
                      <small className="text-gray-600">{selectedThemeData.attributes.description}</small>
                    </div>
                  )}
                </div>

                {/* Scenario Selection */}
                <div className="mb-4">
                  <label htmlFor="scenario" className="block text-sm font-medium text-gray-700 mb-1">
                    <strong>Select Scenario</strong>
                  </label>
                  <select
                    id="scenario"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedScenario}
                    onChange={(e) => setSelectedScenario(e.target.value)}
                  >
                    <option value="">Choose a scenario...</option>
                    {scenarios.map((scenario) => (
                      <option key={scenario.id} value={scenario.id}>
                        {scenario.attributes.title}
                      </option>
                    ))}
                  </select>
                  {selectedScenarioData && (
                    <div className="mt-2 p-3 bg-gray-50 rounded">
                      <small className="text-gray-600">{selectedScenarioData.attributes.description}</small>
                    </div>
                  )}
                </div>

                {/* Selection Summary */}
                {selectedTheme && selectedScenario && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                    <h6 className="text-green-800 font-medium mb-2">Ready to Start!</h6>
                    <p className="mb-1 text-sm">
                      <strong>Theme:</strong> {selectedThemeData?.attributes.title}
                    </p>
                    <p className="mb-0 text-sm">
                      <strong>Scenario:</strong> {selectedScenarioData?.attributes.title}
                    </p>
                  </div>
                )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="secondary"
                        onClick={() => navigate('/chat')}
                      >
                        Skip Setup
                      </Button>
                      <Button
                        variant="primary"
                        disabled={!selectedTheme || !selectedScenario}
                        onClick={handleStartChat}
                      >
                        Start Chat
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
