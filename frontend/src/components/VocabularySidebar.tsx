import { type VocabularyWord } from '../api'

interface VocabularySidebarProps {
  vocabularyWords: VocabularyWord[]
  selectedLanguageLevel: string
  selectedTheme: string
  isLoading?: boolean
}

export default function VocabularySidebar({
  vocabularyWords,
  selectedLanguageLevel,
  selectedTheme,
  isLoading = false
}: VocabularySidebarProps) {
  // Dummy data
  const dummyWords = [
    { german: 'Hallo', translation: 'Hello' },
    { german: 'Guten Tag', translation: 'Good day' },
    { german: 'Auf Wiedersehen', translation: 'Goodbye' }
  ]

  return (
    <div className="absolute top-2 right-4 w-80 h-[calc(100vh-1rem)] bg-green-50 rounded-2xl shadow-xl overflow-hidden flex flex-col z-20">
      <div className="bg-gradient-to-r from-secondary to-tertiary text-white px-4 py-2 flex-shrink-0">
        <h3 className="text-xl font-semibold">Vocabulary Words</h3>
        {selectedLanguageLevel && selectedTheme && (
          <p className="text-xs text-blue-100 mt-1">
            {vocabularyWords.length} words
          </p>
        )}
      </div>
      <div className="p-3 overflow-y-auto flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-xs text-gray-500">Loading vocabulary...</div>
          </div>
        ) : (
          <div className="space-y-2">
            {dummyWords.map((word, idx) => (
              <div key={idx} className="p-2 bg-white rounded border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">{word.german}</span>
                  <span className="text-sm text-gray-600">{word.translation}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

