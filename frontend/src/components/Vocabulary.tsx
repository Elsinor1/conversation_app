import { useState, useEffect } from 'react';
import { 
  getVocabularyWords, 
  getUserVocabularyWords, 
  updateVocabularySelection,
  getThemes,
  getUserLanguageLevels,
  type VocabularyWord, 
  type UserVocabularyWord, 
  type VocabularyTheme,
  type LanguageLevel 
} from '../api';
import { 
  FaChevronDown,
  FaBookOpen 
} from 'react-icons/fa';
import VocabularyWordCard from './VocabularyWordCard';

interface VocabularyProps {
  token: string;
}

type LearningStatus = 'not_learned' | 'in_progress' | 'learned';

export default function Vocabulary({ token }: VocabularyProps) {
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([]);
  const [userVocabularyWords, setUserVocabularyWords] = useState<UserVocabularyWord[]>([]);
  const [themes, setThemes] = useState<VocabularyTheme[]>([]);
  const [languageLevels, setLanguageLevels] = useState<LanguageLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedLanguage, setSelectedLanguage] = useState<string | number | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | number | null>(null); // Can be UUID string or number
  const [selectedStatus, setSelectedStatus] = useState<LearningStatus | 'all'>('all');

  // Selection state for words to mark as learned
  const [selectedWordIds, setSelectedWordIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  // Dropdown states
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [words, userWords, themesData, languagesData] = await Promise.all([
          getVocabularyWords(token),
          getUserVocabularyWords(token),
          getThemes(token),
          getUserLanguageLevels(token)
        ]);
        
        // Ensure we have arrays (API functions now handle unwrapping)
        setVocabularyWords(Array.isArray(words) ? words : []);
        setUserVocabularyWords(Array.isArray(userWords) ? userWords : []);
        setThemes(Array.isArray(themesData) ? themesData : []);
        setLanguageLevels(Array.isArray(languagesData) ? languagesData : []);
        
        console.log('Processed themes:', Array.isArray(themesData) ? themesData : []);
        console.log('Processed languages:', Array.isArray(languagesData) ? languagesData : []);
        console.log('First theme sample:', Array.isArray(themesData) && themesData.length > 0 ? themesData[0] : null);
        console.log('First language sample:', Array.isArray(languagesData) && languagesData.length > 0 ? languagesData[0] : null);
        console.log('Vocabulary words:', Array.isArray(words) ? words : []);
        console.log('User vocabulary words:', Array.isArray(userWords) ? userWords : []);
        
        // Set default language if available
        if (Array.isArray(languagesData) && languagesData.length > 0) {
          setSelectedLanguage(languagesData[0].language.id);
        }
      } catch (err) {
        console.error('Error fetching vocabulary data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load vocabulary data');
        // Set empty arrays as fallback
        setVocabularyWords([]);
        setUserVocabularyWords([]);
        setThemes([]);
        setLanguageLevels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setLanguageDropdownOpen(false);
        setThemeDropdownOpen(false);
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getWordStatus = (vocabularyWordId: number): LearningStatus => {
    const userWord = userVocabularyWords.find(uw => uw.vocabulary_word.id === vocabularyWordId);
    return userWord?.learning_status || 'not_learned';
  };

  // Convert learning status string to number (0-100)
  const getLearningStatusNumber = (vocabularyWordId: number): number => {
    const status = getWordStatus(vocabularyWordId);
    switch (status) {
      case 'not_learned':
        return 0;
      case 'in_progress':
        return 50;
      case 'learned':
        return 100;
      default:
        return 0;
    }
  };

  // Handle card click - toggle selection
  const handleCardClick = (vocabularyWordId: number) => {
    setSelectedWordIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vocabularyWordId)) {
        newSet.delete(vocabularyWordId);
      } else {
        newSet.add(vocabularyWordId);
      }
      return newSet;
    });
  };

  // Handle save button - update selection for practice
  const handleSave = async () => {
    if (selectedWordIds.size === 0) {
      return; // Nothing to save
    }

    try {
      setSaving(true);
      setError(null);

      // Get currently selected words for practice (from existing userVocabularyWords)
      const currentlySelectedWordIds = new Set(
        userVocabularyWords
          .filter(uw => uw.is_selected_for_practice)
          .map(uw => uw.vocabulary_word.id)
      );

      // Determine which words to select and unselect
      const selectedWordIdsArray = Array.from(selectedWordIds);
      const unselectedWordIdsArray = Array.from(currentlySelectedWordIds).filter(
        id => !selectedWordIds.has(id)
      );

      // Call the backend to update selection
      await updateVocabularySelection(token, selectedWordIdsArray, unselectedWordIdsArray);

      // Refresh user vocabulary words to get updated data
      const refreshedUserWords = await getUserVocabularyWords(token);
      setUserVocabularyWords(Array.isArray(refreshedUserWords) ? refreshedUserWords : []);

      // Clear selection after save
      setSelectedWordIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vocabulary selection');
    } finally {
      setSaving(false);
    }
  };

  const filteredWords = (Array.isArray(vocabularyWords) ? vocabularyWords : []).filter(word => {
    // Filter by language - check if word's level matches any language level with selected language
    if (selectedLanguage !== null) {
      // This filter might need adjustment based on your data structure
      // If you want to filter by language, you'd need language info in vocabulary words
      // For now, skipping this filter as word.level.id is a level ID, not language ID
    }

    // Filter by theme
    if (selectedTheme && !word.theme.some(theme => String(theme.id) === String(selectedTheme))) {
      return false;
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      const wordStatus = getWordStatus(word.id);
      return wordStatus === selectedStatus;
    }

    return true;
  });

  const selectedLanguageName = selectedLanguage !== null 
    ? languageLevels.find(lang => lang.language.id === selectedLanguage)?.language.name || 'All Languages'
    : 'All Languages';
  const selectedThemeName = selectedTheme !== null
    ? themes.find(theme => String(theme.id) === String(selectedTheme))?.title || 'All Themes'
    : 'All Themes';
  const statusLabels = {
    all: 'All Status',
    not_learned: 'Not Learned',
    in_progress: 'In Progress',
    learned: 'Learned'
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="ml-18 pt-16 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading vocabulary...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <div className="ml-18 pt-16 p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="ml-18 pt-16 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <FaBookOpen className="text-blue-600" />
            Vocabulary
          </h1>
          <p className="text-gray-600">Manage and track your vocabulary learning progress</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Language Dropdown */}
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <div className="relative">
                <button
                  onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-left min-w-[200px] flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span>{selectedLanguageName}</span>
                  <FaChevronDown className={`text-gray-400 transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {languageDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        setSelectedLanguage(null);
                        setLanguageDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 first:rounded-t-lg"
                    >
                      All Languages
                    </button>
                    {languageLevels.length > 0 ? (
                      languageLevels.map(language => (
                        <button
                          key={language.id}
                          onClick={() => {
                            setSelectedLanguage(language.language.id);
                            setLanguageDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 last:rounded-b-lg"
                        >
                          {language.language.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500 text-sm">
                        No languages available ({languageLevels.length} items)
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Theme Dropdown */}
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <div className="relative">
                <button
                  onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-left min-w-[200px] flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span>{selectedThemeName}</span>
                  <FaChevronDown className={`text-gray-400 transition-transform ${themeDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {themeDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        setSelectedTheme(null);
                        setThemeDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 first:rounded-t-lg"
                    >
                      All Themes
                    </button>
                    {themes.length > 0 ? (
                      themes.map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => {
                            console.log('Theme clicked:', theme, 'Setting theme ID to:', theme.id);
                            setSelectedTheme(theme.id);
                            setThemeDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 last:rounded-b-lg"
                        >
                          {theme.title || `Theme ${theme.id}`}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500 text-sm">No themes available</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="relative">
                <button
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-left min-w-[200px] flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span>{statusLabels[selectedStatus]}</span>
                  <FaChevronDown className={`text-gray-400 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {statusDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => {
                          setSelectedStatus(value as LearningStatus | 'all');
                          setStatusDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Start Practice Button */}
            <div className="flex items-end">
              <button
                onClick={handleSave}
                disabled={selectedWordIds.size === 0 || saving}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  selectedWordIds.size === 0 || saving
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {saving ? 'Saving...' : `Start practice ${selectedWordIds.size} words selected`}
              </button>
            </div>
          </div>
        </div>

        {/* Vocabulary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWords.map(word => (
            <VocabularyWordCard
              key={word.id}
              word={word}
              selectedLanguage={selectedLanguageName !== 'All Languages' ? selectedLanguageName : null}
              learningStatus={getLearningStatusNumber(word.id)}
              isSelectedForLearning={selectedWordIds.has(word.id)}
              onClick={() => handleCardClick(word.id)}
            />
          ))}
        </div>

        {filteredWords.length === 0 && (
          <div className="text-center py-12">
            <FaBookOpen className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No vocabulary words found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more words.</p>
          </div>
        )}
      </div>
    </div>
  );
}
