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
    <div className="min-vh-100 bg-light py-4">
      <div className="container-fluid px-3">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-6">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h1 className="h4 mb-0">Setup Your Chat Experience</h1>
              </div>
              
              <div className="card-body">
                <p className="text-muted mb-4">
                  Choose a theme and scenario to customize your AI conversation experience.
                </p>

                {/* Loading State */}
                {isLoading && (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading themes and scenarios...</p>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <strong>Error:</strong> {error}
                    <button 
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Debug Info */}
                {!isLoading && !error && (
                  <div className="mb-3 p-2 bg-info bg-opacity-10 rounded">
                    <small className="text-muted">
                      Debug: Themes: {themes.length}, Scenarios: {scenarios.length}
                    </small>
                  </div>
                )}

                {/* Content - only show when not loading and no error */}
                {!isLoading && !error && (
                  <>
                    {/* Theme Selection */}
                    <div className="mb-4">
                  <label htmlFor="theme" className="form-label">
                    <strong>Select Theme</strong>
                  </label>
                  <select
                    id="theme"
                    className="form-select"
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
                    <div className="mt-2 p-3 bg-light rounded">
                      <small className="text-muted">{selectedThemeData.attributes.description}</small>
                    </div>
                  )}
                </div>

                {/* Scenario Selection */}
                <div className="mb-4">
                  <label htmlFor="scenario" className="form-label">
                    <strong>Select Scenario</strong>
                  </label>
                  <select
                    id="scenario"
                    className="form-select"
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
                    <div className="mt-2 p-3 bg-light rounded">
                      <small className="text-muted">{selectedScenarioData.attributes.description}</small>
                    </div>
                  )}
                </div>

                {/* Selection Summary */}
                {selectedTheme && selectedScenario && (
                  <div className="mb-4 p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded">
                    <h6 className="text-success mb-2">Ready to Start!</h6>
                    <p className="mb-1">
                      <strong>Theme:</strong> {selectedThemeData?.attributes.title}
                    </p>
                    <p className="mb-0">
                      <strong>Scenario:</strong> {selectedScenarioData?.attributes.title}
                    </p>
                  </div>
                )}

                    {/* Action Buttons */}
                    <div className="d-flex gap-2 justify-content-end">
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
