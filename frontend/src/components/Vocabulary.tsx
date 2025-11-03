import { useState, useEffect } from 'react';
import { 
  getVocabularyWords, 
  getUserVocabularyWords, 
  updateUserVocabularyWordStatus, 
  createUserVocabularyWordStatus,
  getThemes,
  getUserLanguageLevels,
  type VocabularyWord, 
  type UserVocabularyWord, 
  type VocabularyTheme,
  type LanguageLevel 
} from '../api';
import { 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle, 
  FaChevronDown,
  FaBookOpen 
} from 'react-icons/fa';

interface VocabularyProps {
  token: string;
}

type LearningStatus = 'not_learned' | 'in_progress' | 'learned';

export default function Vocabulary({ token }: VocabularyProps) {
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([]);
  const [userVocabularyWords, setUserVocabularyWords] = useState<UserVocabularyWord[]>([]);
  const [themes, setThemes] = useState<VocabularyTheme[]>([]);
  const [userLanguages, setUserLanguages] = useState<LanguageLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedLanguage, setSelectedLanguage] = useState<number | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<LearningStatus | 'all'>('all');

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
        
        // Ensure we have arrays
        setVocabularyWords(Array.isArray(words) ? words : []);
        setUserVocabularyWords(Array.isArray(userWords) ? userWords : []);
        setThemes(Array.isArray(themesData) ? themesData : []);
        setUserLanguages(Array.isArray(languagesData) ? languagesData : []);
        
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
        setUserLanguages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleStatusChange = async (vocabularyWordId: number, newStatus: LearningStatus) => {
    try {
      const existingUserWord = userVocabularyWords.find(
        uw => uw.vocabulary_word.id === vocabularyWordId
      );

      if (existingUserWord) {
        // Update existing status
        const updated = await updateUserVocabularyWordStatus(token, existingUserWord.id, newStatus);
        setUserVocabularyWords(prev => 
          prev.map(uw => uw.id === existingUserWord.id ? updated : uw)
        );
      } else {
        // Create new status
        const newUserWord = await createUserVocabularyWordStatus(token, vocabularyWordId, newStatus);
        setUserVocabularyWords(prev => [...prev, newUserWord]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update word status');
    }
  };

  const getWordStatus = (vocabularyWordId: number): LearningStatus => {
    const userWord = userVocabularyWords.find(uw => uw.vocabulary_word.id === vocabularyWordId);
    return userWord?.learning_status || 'not_learned';
  };

  const getStatusIcon = (status: LearningStatus) => {
    switch (status) {
      case 'learned':
        return <FaCheckCircle className="text-green-500" />;
      case 'in_progress':
        return <FaClock className="text-yellow-500" />;
      case 'not_learned':
        return <FaTimesCircle className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: LearningStatus) => {
    switch (status) {
      case 'learned':
        return 'bg-green-100 border-green-300';
      case 'in_progress':
        return 'bg-yellow-100 border-yellow-300';
      case 'not_learned':
        return 'bg-gray-100 border-gray-300';
    }
  };

  const filteredWords = (Array.isArray(vocabularyWords) ? vocabularyWords : []).filter(word => {
    // Filter by language
    if (selectedLanguage !== null && word.level.id !== selectedLanguage) {
      return false;
    }

    // Filter by theme
    if (selectedTheme && !word.theme.some(theme => theme.id === selectedTheme)) {
      return false;
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      const wordStatus = getWordStatus(word.id);
      return wordStatus === selectedStatus;
    }

    return true;
  });

  const selectedLanguageName = userLanguages.find(lang => lang.language.id === selectedLanguage)?.language.name || 'All Languages';
  const selectedThemeName = themes.find(theme => theme.id === selectedTheme)?.title || 'All Themes';
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
            <div className="relative">
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
                    {userLanguages.map(language => (
                      <button
                        key={language.language.id}
                        onClick={() => {
                          setSelectedLanguage(language.language.id);
                          setLanguageDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 last:rounded-b-lg"
                      >
                        {language.language.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Theme Dropdown */}
            <div className="relative">
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
                    {themes.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setSelectedTheme(theme.id);
                          setThemeDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 last:rounded-b-lg"
                      >
                        {theme.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
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
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                      >
                        {value !== 'all' && getStatusIcon(value as LearningStatus)}
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Vocabulary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWords.map(word => {
            const wordStatus = getWordStatus(word.id);
            return (
              <div
                key={word.id}
                className={`border-2 rounded-lg p-6 transition-all duration-200 hover:shadow-lg ${getStatusColor(wordStatus)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{word.word}</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">German:</span> {word.german_translation}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Czech:</span> {word.czech_translation}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4">
                    {getStatusIcon(wordStatus)}
                  </div>
                </div>

                <div className="mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {word.level.ABC_value}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">Themes:</div>
                  <div className="flex flex-wrap gap-1">
                    {word.theme.map(theme => (
                      <span
                        key={theme.id}
                        className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {theme.title}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status Change Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(word.id, 'not_learned')}
                    className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
                      wordStatus === 'not_learned'
                        ? 'bg-gray-200 text-gray-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Not Learned
                  </button>
                  <button
                    onClick={() => handleStatusChange(word.id, 'in_progress')}
                    className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
                      wordStatus === 'in_progress'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange(word.id, 'learned')}
                    className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
                      wordStatus === 'learned'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                  >
                    Learned
                  </button>
                </div>
              </div>
            );
          })}
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
