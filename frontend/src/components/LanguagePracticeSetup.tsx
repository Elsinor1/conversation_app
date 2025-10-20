import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPracticeSetupData, createChat, type JSONAPITheme, type LanguageLevel } from '../api'
import Button from './Button'
import { LuGraduationCap, LuBookOpen, LuUsers, LuPlay, LuGlobe } from 'react-icons/lu'

interface LanguagePracticeSetupProps {
  token: string
}

export default function LanguagePracticeSetup({ token }: LanguagePracticeSetupProps) {
  const [themes, setThemes] = useState<JSONAPITheme[]>([])
  const [languageLevels, setLanguageLevels] = useState<LanguageLevel[]>([])
  const [selectedTheme, setSelectedTheme] = useState('')
  const [selectedScenario, setSelectedScenario] = useState('')
  const [selectedLanguageLevel, setSelectedLanguageLevel] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        console.log('Fetching practice setup data...')
        const data = await getPracticeSetupData(token)
        
        console.log('Practice setup data:', data)
        console.log('Data structure:', JSON.stringify(data, null, 2))
        
        // Extract themes and language levels from the response
        const themesData = data.themes || []
        const languageLevelsData = data.language_levels || []
        
        console.log('Extracted themes:', themesData)
        console.log('Extracted language levels:', languageLevelsData)
        
        setThemes(themesData)
        setLanguageLevels(languageLevelsData)
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err?.message || 'Failed to load practice setup data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token])

  const handleStartPractice = async () => {
    if (!selectedTheme || !selectedScenario || !selectedLanguageLevel) {
      alert('Please select a theme, scenario, and language level before starting your practice session.')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      
      // Use the selected language level
      const languageLevelId = selectedLanguageLevel
      const selectedLangLevel = languageLevels.find(ll => ll.id.toString() === selectedLanguageLevel)
      console.log('Using language level:', selectedLangLevel)
      
      console.log('Creating chat session with:', { theme: selectedTheme, scenario: selectedScenario, language_level: languageLevelId })
      
      const chatResponse = await createChat({
        token,
        theme: selectedTheme,
        scenario: selectedScenario,
        language_level: languageLevelId
      })
      
      console.log('Chat created:', chatResponse)
      
      // Navigate to practice chat with the new chat ID
      navigate(`/practice?chat-id=${chatResponse.id}`)
      
    } catch (err: any) {
      console.error('Error creating chat:', err)
      setError(err?.message || 'Failed to start practice session')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedThemeData = Array.isArray(themes) ? themes.find(t => t.id === selectedTheme) : null
  const selectedScenarioData = selectedThemeData?.scenarios?.find(s => s.id === selectedScenario)

  // Get scenarios for the selected theme
  const filteredScenarios = selectedThemeData?.scenarios || []

  // Debug logging
  console.log('Debug - selectedTheme:', selectedTheme)
  console.log('Debug - themes:', themes)
  console.log('Debug - themes length:', themes.length)
  console.log('Debug - first theme:', themes[0])
  console.log('Debug - filteredScenarios:', filteredScenarios)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 ml-18">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <LuGraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Practice Setup</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your practice theme and scenario to start an immersive conversation experience
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-secondary to-tertiary text-white px-8 py-6">
                <h2 className="text-2xl font-semibold flex items-center">
                  <LuBookOpen className="mr-3" />
                  Setup Your Practice Session
                </h2>
                <p className="mt-2 text-blue-100">
                  Select a theme and scenario to customize your AI conversation experience
                </p>
              </div>
              
              <div className="p-8">
                {/* Loading State */}
                {isLoading && (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600 text-lg">Loading practice options...</p>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6" role="alert">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-red-800">
                          <strong>Error:</strong> {error}
                        </h3>
                        <button 
                          className="mt-3 text-sm text-red-600 hover:text-red-500 underline"
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
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Debug Information:</h4>
                    <div className="text-sm text-yellow-700 space-y-1">
                      <div>Themes loaded: {Array.isArray(themes) ? themes.length : 0}</div>
                      <div>Total scenarios: {Array.isArray(themes) ? themes.reduce((total, theme) => total + (theme.scenarios?.length || 0), 0) : 0}</div>
                      <div>Selected theme: {selectedTheme || 'None'}</div>
                      <div>Filtered scenarios: {filteredScenarios.length}</div>
                      {Array.isArray(themes) && themes.length > 0 && (
                        <div>First theme: {themes[0].title} (ID: {themes[0].id}) - {themes[0].scenarios?.length || 0} scenarios</div>
                      )}
                      {Array.isArray(themes) && themes.length > 0 && (
                        <div>Theme structure: {JSON.stringify(themes[0], null, 2)}</div>
                      )}
                      {filteredScenarios.length > 0 && (
                        <div>First scenario: {filteredScenarios[0]?.title} (ID: {filteredScenarios[0]?.id})</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Content - only show when not loading and no error */}
                {!isLoading && !error && (
                  <div className="space-y-8">
                    {/* Theme Selection */}
                    <div>
                      <label htmlFor="theme" className="block text-lg font-semibold text-gray-900 mb-3">
                        <LuBookOpen className="inline mr-2" />
                        Choose Your Theme
                      </label>
                      <select
                        id="theme"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                        value={selectedTheme}
                        onChange={(e) => {
                          setSelectedTheme(e.target.value)
                          setSelectedScenario('') // Reset scenario when theme changes
                        }}
                      >
                        <option value="">Select a theme...</option>
                        {Array.isArray(themes) && themes.length > 0 ? (
                          themes.map((theme) => (
                            <option key={theme.id} value={theme.id}>
                              {theme.title}
                            </option>
                          ))
                        ) : (
                          <option disabled>No themes available</option>
                        )}
                      </select>
                      {selectedThemeData && (
                        <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-gray-700">{selectedThemeData?.description}</p>
                        </div>
                      )}
                    </div>

                    {/* Language Level Selection */}
                    <div>
                      <label htmlFor="languageLevel" className="block text-lg font-semibold text-gray-900 mb-3">
                        <LuGlobe className="inline mr-2" />
                        Choose Your Language Level
                      </label>
                      <select
                        id="languageLevel"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                        value={selectedLanguageLevel}
                        onChange={(e) => setSelectedLanguageLevel(e.target.value)}
                      >
                        <option value="">Select a language level...</option>
                        {Array.isArray(languageLevels) && languageLevels.length > 0 ? (
                          languageLevels.map((langLevel) => (
                            <option key={langLevel.id} value={langLevel.id.toString()}>
                              {langLevel.language.name} - {langLevel.level.name}
                            </option>
                          ))
                        ) : (
                          <option disabled>No language levels available - Please add a language level to your profile</option>
                        )}
                      </select>
                      {selectedLanguageLevel && (
                        <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-gray-700">
                            You'll practice <strong>{languageLevels.find(ll => ll.id.toString() === selectedLanguageLevel)?.language.name}</strong> at <strong>{languageLevels.find(ll => ll.id.toString() === selectedLanguageLevel)?.level.name}</strong> level
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Scenario Selection */}
                    <div>
                      <label htmlFor="scenario" className="block text-lg font-semibold text-gray-900 mb-3">
                        <LuUsers className="inline mr-2" />
                        Choose Your Scenario
                      </label>
                      <select
                        id="scenario"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                        value={selectedScenario}
                        onChange={(e) => setSelectedScenario(e.target.value)}
                        disabled={!selectedTheme}
                      >
                        <option value="">
                          {selectedTheme ? "Select a scenario..." : "Please select a theme first"}
                        </option>
                        {filteredScenarios.map((scenario) => (
                          <option key={scenario.id} value={scenario.id}>
                            {scenario.title}
                          </option>
                        ))}
                        {/* Debug: Show all scenarios when no theme selected */}
                        {!selectedTheme && Array.isArray(themes) && themes.length > 0 && (
                          <>
                            <option disabled>--- Debug: All scenarios ---</option>
                            {themes.map((theme) => 
                              theme.scenarios?.map((scenario) => (
                                <option key={`debug-${scenario.id}`} value={scenario.id}>
                                  DEBUG: {scenario.title} (Theme: {theme.title})
                                </option>
                              ))
                            )}
                          </>
                        )}
                      </select>
                      {selectedScenarioData && (
                        <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="space-y-2">
                            <p className="text-gray-700">{selectedScenarioData.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-600">AI Role:</span>
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                  {selectedScenarioData.teacher_role}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-medium text-gray-600">Your Role:</span>
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">
                                  {selectedScenarioData.student_role}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Selection Summary */}
                    {selectedTheme && selectedScenario && selectedLanguageLevel && (
                      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                        <div className="flex items-center mb-4">
                          <div className="bg-green-500 p-2 rounded-full mr-3">
                            <LuPlay className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-green-800">Ready to Practice!</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Theme</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {selectedThemeData?.title || 'No theme selected'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Scenario</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {selectedScenarioData?.title || 'No scenario selected'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Language Level</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {languageLevels.find(ll => ll.id.toString() === selectedLanguageLevel)?.language.name} - {languageLevels.find(ll => ll.id.toString() === selectedLanguageLevel)?.level.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          // For now, show an alert. In the future, this could open a modal for custom scenario creation
                          alert('Custom scenario creation feature coming soon! For now, please select from the available themes and scenarios.')
                        }}
                        className="px-8 py-3 text-lg"
                      >
                        Create Custom Scenario
                      </Button>
                      <Button
                        variant="primary"
                        disabled={!selectedTheme || !selectedScenario || !selectedLanguageLevel}
                        onClick={handleStartPractice}
                        className="px-8 py-3 text-lg flex items-center"
                      >
                        <LuPlay className="mr-2" />
                        Start Practice
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
