import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getVocabularyWords, 
  getUserVocabularyWords, 
  updateVocabularySelection,
  getVocabularyLists,
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
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());
  const [selectedUserVocabularyWordIds, setSelectedUserVocabularyWordIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  
  const navigate = useNavigate();

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
        setThemes(Array.isArray(themesData) ? themesData : []);
        setLanguageLevels(Array.isArray(languagesData) ? languagesData : []);
        
        console.log('Processed themes:', Array.isArray(themesData) ? themesData : []);
        console.log('Processed languages:', Array.isArray(languagesData) ? languagesData : []);
        console.log('First theme sample:', Array.isArray(themesData) && themesData.length > 0 ? themesData[0] : null);
        console.log('First language sample:', Array.isArray(languagesData) && languagesData.length > 0 ? languagesData[0] : null);
        console.log('Vocabulary words:', Array.isArray(words) ? words : []);
        console.log('User vocabulary words:', Array.isArray(userWords) ? userWords : []);
        
        // Set default language if available
        const defaultLanguageId = Array.isArray(languagesData) && languagesData.length > 0 
          ? languagesData[0].language.id 
          : null;
        
        if (defaultLanguageId !== null) {
          setSelectedLanguage(defaultLanguageId);
          // Fetch and filter user vocabulary words based on vocabulary list for the selected language
          await getUserVocabularyWordsAndSelectThemForPractice(defaultLanguageId, userWords);
        } else {
          // No language selected, just set all user vocabulary words
          setUserVocabularyWords(Array.isArray(userWords) ? userWords : []);
          setSelectedUserVocabularyWordIds(new Set());
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

  // Re-filter user vocabulary words when selected language changes
  useEffect(() => {
    if (selectedLanguage !== null && userVocabularyWords.length > 0) {
      getUserVocabularyWordsAndSelectThemForPractice(selectedLanguage);
    }
  }, [selectedLanguage, token]);

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

  const getUserVocabularyWordsAndSelectThemForPractice = async (languageId: string | number | null = null, preFetchedWords?: UserVocabularyWord[]) => {
    // Use pre-fetched words if provided, otherwise fetch them
    const userVocabularyWords = preFetchedWords || await getUserVocabularyWords(token);
    console.log('User vocabulary words:', userVocabularyWords);
    
    // Use provided languageId or fall back to selectedLanguage state
    const targetLanguageId = languageId !== null ? languageId : selectedLanguage;
    
    // Get vocabulary lists and filter by selected language
    let filteredIds: string[] = [];
    
    if (targetLanguageId !== null) {
      const vocabularyLists = await getVocabularyLists(token);
      console.log('Vocabulary lists:', vocabularyLists);
      
      const vocabularyList = vocabularyLists.find(vl => vl.language.id === targetLanguageId);
      console.log('Found vocabulary list for language:', vocabularyList);
      
      if (vocabularyList && vocabularyList.user_vocabulary_word) {
        // Convert vocabulary list IDs to strings for comparison
        const vocabularyListIds = new Set(
          vocabularyList.user_vocabulary_word.map(id => String(id))
        );
        console.log('Vocabulary list user_vocabulary_word IDs:', vocabularyListIds);
        
        // Filter user vocabulary words to only include those in the vocabulary list
        filteredIds = userVocabularyWords
          .filter(word => vocabularyListIds.has(String(word.id)))
          .map(word => word.id);
        console.log('Filtered IDs from vocabulary list:', filteredIds);
      } else {
        console.log('No vocabulary list found or no user_vocabulary_word in list');
      }
    }
    
    // If no language selected or no vocabulary list found, don't select any (empty set)
    // This ensures only words in the vocabulary list are selected
    const selectedIdsSet = new Set(filteredIds);
    console.log('Created Set from filtered IDs:', selectedIdsSet);
    console.log('Set size:', selectedIdsSet.size);
    console.log('Set contents (Array.from):', Array.from(selectedIdsSet));
    
    setUserVocabularyWords(userVocabularyWords);
    setSelectedUserVocabularyWordIds(selectedIdsSet);
  };


  // Handle card click - toggle selection
  const handleCardClick = (vocabularyWordId: string | number) => {
    const idString = String(vocabularyWordId);
    setSelectedWordIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idString)) {
        newSet.delete(idString);
        console.log('Selected word ID removed:', idString)
      } else {
        newSet.add(idString);
        console.log('Selected word ID added:', idString)
      }
      // console.log('Selected word IDs:', newSet)
      return newSet;
    });
  };

  const handleUserVocabularyWordCardClick = (userVocabularyWordId: string) => {
    setSelectedUserVocabularyWordIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userVocabularyWordId)) {
        newSet.delete(userVocabularyWordId);
        console.log('Selected user vocabulary word ID removed:', userVocabularyWordId)
      } else {
        newSet.add(userVocabularyWordId);
        console.log('Selected user vocabulary word ID added:', userVocabularyWordId)
      }
      // console.log('Selected user vocabulary word IDs:', newSet)
      return newSet;
    });
  };

  // Handle save button - update selection for practice and start practice
  const handleStartPractice = async () => {
    console.log('handleStartPractice called');
    console.log('selectedWordIds:', selectedWordIds.size, Array.from(selectedWordIds));
    console.log('selectedUserVocabularyWordIds:', selectedUserVocabularyWordIds.size, Array.from(selectedUserVocabularyWordIds));
    if (selectedWordIds.size === 0 && selectedUserVocabularyWordIds.size === 0) {
      console.error('No words or user vocabulary words selected.');
      return; // Nothing to practice
    }

    try {
      setSaving(true);
      setError(null);

      // Get vocabulary list (should be created automatically with language level)
      const vocabularyLists = await getVocabularyLists(token);
      console.log('Vocabulary lists:', vocabularyLists);
      
      if (vocabularyLists.length === 0) {
        throw new Error('No vocabulary list found. Vocabulary lists are created automatically when you set up a language level. Please set up a language level first.');
      }
      
      // Use the vocabulary list for the selected language
      const vocabularyList = vocabularyLists.find(vocabularyList => vocabularyList.language.id === selectedLanguage);
      if (!vocabularyList) {
        throw new Error('No vocabulary list found for the selected language.');
      }
      
      // Update vocabulary list with PUT
      await updateVocabularySelection(token, vocabularyList.id, Array.from(selectedWordIds), Array.from(selectedUserVocabularyWordIds));

      // Get the actual word objects for practice
      const wordsForPractice = vocabularyWords.filter(word => selectedWordIds.has(String(word.id)));
      const userWordsForPractice = userVocabularyWords.filter(userWord => selectedUserVocabularyWordIds.has(userWord.id));
      
      // Navigate to practice page with data
      const selectedLanguageName = selectedLanguage !== null 
        ? languageLevels.find(lang => lang.language.id === selectedLanguage)?.language.name || 'German'
        : 'German';
      
      navigate('/vocabulary-practice', {
        state: {
          selectedWords: wordsForPractice,
          selectedUserWords: userWordsForPractice,
          learnedLanguage: selectedLanguageName !== 'All Languages' ? selectedLanguageName : 'German'
        }
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start practice');
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
    if (selectedTheme !== null && word.theme.some(theme => String(theme.id) === String(selectedTheme))) {
      return false;
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      return false;
    }

    return true;
  });

  const filteredUserVocabularyWords = (Array.isArray(userVocabularyWords) ? userVocabularyWords : []).filter(userWord => {
    // Filter by language - check if user word's level matches any language level with selected language
    if (selectedLanguage !== null) {
      // This filter might need adjustment based on your data structure
      // If you want to filter by language, you'd need language info in vocabulary words
      // For now, skipping this filter as word.level.id is a level ID, not language ID
    }
    if (selectedTheme !== null && userWord.vocabulary_word.theme.some(theme => String(theme.id) === String(selectedTheme))) {
      return false;
    }

    if (selectedStatus === 'all') {
      return true;
    }
    if (selectedStatus === 'not_learned' && userWord.learning_status === 0) {
      return true;
    }
    if (selectedStatus === 'in_progress' && userWord.learning_status > 0 && userWord.learning_status < 100) {
      return true;
    }
    if (selectedStatus === 'learned' && userWord.learning_status === 100) {
      return true;
    }
    return false;
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
                onClick={() => {
                  console.log('Start Practice Button clicked!', {
                    selectedWordIds: selectedWordIds.size,
                    selectedUserVocabularyWordIds: selectedUserVocabularyWordIds.size,
                    saving,
                    disabled: (selectedWordIds.size === 0 && selectedUserVocabularyWordIds.size === 0) || saving
                  });
                  handleStartPractice();
                }}
                disabled={(selectedWordIds.size + selectedUserVocabularyWordIds.size === 0) || saving}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  (selectedWordIds.size + selectedUserVocabularyWordIds.size === 0) || saving
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {saving ? 'Starting...' : `Start practice ${selectedWordIds.size + selectedUserVocabularyWordIds.size} words selected`}
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
              learningStatus={0}
              isSelectedForLearning={selectedWordIds.has(String(word.id))}
              onClick={() => handleCardClick(word.id)}
            />
          ))}
        </div>
        {/* User Vocabulary Words Grid */}
        <div className="grid bg-red-500 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUserVocabularyWords.map(userWord => (
            <VocabularyWordCard
              key={userWord.id}
              word={userWord.vocabulary_word}
              selectedLanguage={selectedLanguageName !== 'All Languages' ? selectedLanguageName : null}
              learningStatus={Number(userWord.learning_status)}
              isSelectedForLearning={selectedUserVocabularyWordIds.has(userWord.id)}
              onClick={() => handleUserVocabularyWordCardClick(userWord.id)}
            />
          ))}
        </div>

        {filteredWords.length === 0 && filteredUserVocabularyWords.length === 0 && (
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

