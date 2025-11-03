import { useState, useEffect } from 'react'
import { getLanguages, getLevels, createLanguageLevel, type Language, type Level, type LanguageLevel } from '../api'
import { FaTimes, FaCheck, FaSpinner } from 'react-icons/fa'

interface LanguageSelectorProps {
  token: string
  onLanguageAdded: () => void
  onClose: () => void
  userLanguages?: LanguageLevel[] // Add user's current languages
}

export default function LanguageSelector({ token, onLanguageAdded, onClose, userLanguages = [] }: LanguageSelectorProps) {
  const [languages, setLanguages] = useState<Language[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        console.log('Fetching languages and levels...')
        const [languagesData, levelsData] = await Promise.all([
          getLanguages(token),
          getLevels(token)
        ])
        
        console.log('Languages data:', languagesData)
        console.log('Levels data:', levelsData)
        
        // Ensure we have arrays
        const languagesArray = Array.isArray(languagesData) ? languagesData : []
        const levelsArray = Array.isArray(levelsData) ? levelsData : []
        
        // Filter out languages that user already has
        const userLanguageIds = userLanguages.map(ul => ul.language.id)
        const availableLanguages = languagesArray.filter(lang => !userLanguageIds.includes(lang.id))
        
        setLanguages(availableLanguages)
        setLevels(levelsArray)
      } catch (err: any) {
        console.error('Error fetching languages and levels:', err)
        setError(err?.message || 'Failed to load languages and levels')
        // Set empty arrays as fallback
        setLanguages([])
        setLevels([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token])

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language)
    setSelectedLevel(null) // Reset level selection when language changes
  }

  const handleLevelSelect = (level: Level) => {
    setSelectedLevel(level)
  }

  const handleCreateLanguageLevel = async () => {
    if (!selectedLanguage || !selectedLevel) {
      setError('Please select both a language and a level')
      return
    }

    try {
      setIsCreating(true)
      setError('')
      console.log('Creating language level:', selectedLanguage.id, selectedLevel.id)
      await createLanguageLevel(token, selectedLanguage.id, selectedLevel.id)
      
      // Refresh the dashboard
      onLanguageAdded()
      onClose()
    } catch (err: any) {
      console.error('Error creating language level:', err)
      setError(err?.message || 'Failed to add language')
    } finally {
      setIsCreating(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A1': return 'bg-green-100 text-green-800 border-green-200'
      case 'A2': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'B1': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'B2': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'C1': return 'bg-red-100 text-red-800 border-red-200'
      case 'C2': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <div className="flex items-center justify-center">
            <FaSpinner className="animate-spin h-6 w-6 text-blue-600 mr-3" />
            <span className="text-gray-600">Loading languages and levels...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Language</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size="20" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Language</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {Array.isArray(languages) && languages.length > 0 ? languages.map((language) => (
                <button
                  key={language.id}
                  onClick={() => handleLanguageSelect(language)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedLanguage?.id === language.id
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{language.name}</span>
                    {selectedLanguage?.id === language.id && (
                      <FaCheck className="text-blue-600" />
                    )}
                  </div>
                </button>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p>{userLanguages.length > 0 ? 'All available languages have been added to your profile' : 'No languages available'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Level Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Level</h3>
            {selectedLanguage ? (
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {Array.isArray(levels) && levels.length > 0 ? levels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => handleLevelSelect(level)}
                    className={`w-full text-left p-3 rounded-lg transition-colors border-2 ${
                      selectedLevel?.id === level.id
                        ? `${getLevelColor(level.ABC_value)} border-current`
                        : 'hover:bg-gray-50 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{level.ABC_value}</span>
                        <span className="ml-2 text-sm text-gray-600">- {level.name}</span>
                      </div>
                      {selectedLevel?.id === level.id && (
                        <FaCheck className="text-current" />
                      )}
                    </div>
                  </button>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No levels available</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                <p>Please select a language first</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Language and Level Summary */}
        {selectedLanguage && selectedLevel && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Selected:</h4>
            <div className="flex items-center gap-4">
              <span className="text-blue-800 font-medium">{selectedLanguage.name}</span>
              <span className="text-blue-600">→</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(selectedLevel.ABC_value)}`}>
                {selectedLevel.ABC_value} - {selectedLevel.name}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateLanguageLevel}
            disabled={!selectedLanguage || !selectedLevel || isCreating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <FaSpinner className="animate-spin h-4 w-4" />
                Adding...
              </>
            ) : (
              <>
                <FaCheck className="h-4 w-4" />
                Add Language
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
