import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPracticeSetupData, createChat, type JSONAPITheme, type LanguageLevel } from '../api'
import Button from './Button'
import { LuGraduationCap, LuBookOpen, LuUsers, LuPlay, LuGlobe } from 'react-icons/lu'

interface SpeechPracticeSetupProps {
  token: string
}

export default function SpeechPracticeSetup({ token }: SpeechPracticeSetupProps) {
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
      
      // Navigate to practice chat with chatId in URL and state for theme/scenario data
      navigate(`/speech-practice/${chatResponse.id}`, {
        state: {
          chatId: chatResponse.id,
          theme: selectedThemeData, // Pass full theme object
          scenario: selectedScenarioData, // Pass full scenario object
          themeId: selectedTheme, // Keep ID for reference
          scenarioId: selectedScenario, // Keep ID for reference
          languageLevel: selectedLanguageLevel
        }
      })
      
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
  // console.log('Debug - selectedTheme:', selectedTheme)
  // console.log('Debug - themes:', themes)
  // console.log('Debug - themes length:', themes.length)
  // console.log('Debug - first theme:', themes[0])
  // console.log('Debug - filteredScenarios:', filteredScenarios)

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ml-18 overflow-hidden flex flex-col relative">
        <div className="w-full pt-4 p-4 flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Header Section */}
        <div className="text-center mb-4 flex-shrink-0">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-blue-600 p-2 rounded-full">
              <LuGraduationCap className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Practice Setup</h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Choose your practice theme and scenario to start an immersive conversation experience
          </p>
        </div>

        <div className="flex justify-center flex-1 overflow-hidden min-h-0">
          {/* Main Content */}
          <div className="w-[50%] flex flex-col overflow-hidden min-h-0">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-full min-h-0">
              {/* Header */}
              <div className="bg-gradient-to-r from-secondary to-tertiary text-white px-6 py-3 flex-shrink-0">
                <h2 className="text-xl font-semibold flex items-center">
                  <LuBookOpen className="mr-2 h-5 w-5" />
                  Setup Your Practice Session
                </h2>
                <p className="mt-1 text-sm text-blue-100">
                  Select a theme and scenario to customize your AI conversation experience
                </p>
              </div>
              
              <div className="p-3 flex-1 overflow-hidden flex flex-col min-h-0">
                {/* Loading State */}
                {isLoading && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600 text-base">Loading practice options...</p>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-base font-medium text-red-800">
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

                {/* Content - only show when not loading and no error */}
                {!isLoading && !error && (
                  <div className="space-y-2 flex-1 min-h-0 overflow-hidden">
                    {/* Theme Selection */}
                    <div>
                      <label htmlFor="theme" className="block text-xs font-semibold text-gray-900 mb-0.5">
                        <LuBookOpen className="inline mr-1 h-3 w-3" />
                        Choose Your Theme
                      </label>
                      <select
                        id="theme"
                        className="block w-full px-2 py-1 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
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
                        <div className="mt-1 p-1.5 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-gray-700 leading-tight">{selectedThemeData?.description}</p>
                        </div>
                      )}
                    </div>

                    {/* Language Level Selection */}
                    <div>
                      <label htmlFor="languageLevel" className="block text-xs font-semibold text-gray-900 mb-0.5">
                        <LuGlobe className="inline mr-1 h-3 w-3" />
                        Choose Your Language Level
                      </label>
                      <select
                        id="languageLevel"
                        className="block w-full px-2 py-1 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
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
                        <div className="mt-1 p-1.5 bg-green-50 rounded border border-green-200">
                          <p className="text-xs text-gray-700 leading-tight">
                            You'll practice <strong>{languageLevels.find(ll => ll.id.toString() === selectedLanguageLevel)?.language.name}</strong> at <strong>{languageLevels.find(ll => ll.id.toString() === selectedLanguageLevel)?.level.name}</strong> level
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Scenario Selection */}
                    <div>
                      <label htmlFor="scenario" className="block text-xs font-semibold text-gray-900 mb-0.5">
                        <LuUsers className="inline mr-1 h-3 w-3" />
                        Choose Your Scenario
                      </label>
                      <select
                        id="scenario"
                        className="block w-full px-2 py-1 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
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
                        <div className="mt-1 p-1.5 bg-green-50 rounded border border-green-200">
                          <div className="space-y-0.5">
                            <p className="text-xs text-gray-700 leading-tight">{selectedScenarioData.description}</p>
                            <div className="flex flex-wrap gap-1.5 text-xs">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-600 text-xs">AI Role:</span>
                                <span className="ml-1 px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                  {selectedScenarioData.teacher_role}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-medium text-gray-600 text-xs">Your Role:</span>
                                <span className="ml-1 px-1 py-0.5 bg-green-100 text-green-800 rounded text-xs">
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
                      <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded">
                        <div className="flex items-center mb-1">
                          <div className="bg-green-500 p-0.5 rounded-full mr-1.5">
                            <LuPlay className="h-2.5 w-2.5 text-white" />
                          </div>
                          <h3 className="text-xs font-semibold text-green-800">Ready to Practice!</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-0.5">Theme</p>
                            <p className="text-xs font-semibold text-gray-900 leading-tight">
                              {selectedThemeData?.title || 'No theme selected'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-0.5">Scenario</p>
                            <p className="text-xs font-semibold text-gray-900 leading-tight">
                              {selectedScenarioData?.title || 'No scenario selected'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-0.5">Language Level</p>
                            <p className="text-xs font-semibold text-gray-900 leading-tight">
                              {languageLevels.find(ll => ll.id.toString() === selectedLanguageLevel)?.language.name} - {languageLevels.find(ll => ll.id.toString() === selectedLanguageLevel)?.level.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-1.5 justify-end pt-1 flex-shrink-0">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          // For now, show an alert. In the future, this could open a modal for custom scenario creation
                          alert('Custom scenario creation feature coming soon! For now, please select from the available themes and scenarios.')
                        }}
                        className="px-2 py-1 text-xs"
                      >
                        Create Custom Scenario
                      </Button>
                      <Button
                        variant="primary"
                        disabled={!selectedTheme || !selectedScenario || !selectedLanguageLevel}
                        onClick={handleStartPractice}
                        className="px-2 py-1 text-xs flex items-center"
                      >
                        <LuPlay className="mr-1 h-3 w-3" />
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


      {/* Debug Info Sidebar - Absolutely positioned */}
      {!isLoading && !error && (
        <div className="absolute top-2 right-[5rem] w-80 h-[calc(100vh-1rem)] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="bg-yellow-500 text-white px-4 py-2 flex-shrink-0">
            <h3 className="text-sm font-semibold">Debug Information</h3>
          </div>
          <div className="p-3 overflow-y-auto flex-1">
            <div className="text-xs text-gray-700 space-y-2">
              <div>
                <span className="font-semibold">Themes loaded:</span> {Array.isArray(themes) ? themes.length : 0}
              </div>
              <div>
                <span className="font-semibold">Total scenarios:</span> {Array.isArray(themes) ? themes.reduce((total, theme) => total + (theme.scenarios?.length || 0), 0) : 0}
              </div>
              <div>
                <span className="font-semibold">Selected theme:</span> {selectedTheme || 'None'}
              </div>
              <div>
                <span className="font-semibold">Filtered scenarios:</span> {filteredScenarios.length}
              </div>
              {Array.isArray(themes) && themes.length > 0 && (
                <div>
                  <span className="font-semibold">First theme:</span> {themes[0].title} (ID: {themes[0].id}) - {themes[0].scenarios?.length || 0} scenarios
                </div>
              )}
              {Array.isArray(themes) && themes.length > 0 && (
                <div>
                  <span className="font-semibold">Theme structure:</span>
                  <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(themes[0], null, 2)}
                  </pre>
                </div>
              )}
              {filteredScenarios.length > 0 && (
                <div>
                  <span className="font-semibold">First scenario:</span> {filteredScenarios[0]?.title} (ID: {filteredScenarios[0]?.id})
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
