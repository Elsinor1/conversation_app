import { useState, useEffect } from 'react';
import type { VocabularyWord, UserVocabularyWord } from '../api';
import { FaCheck, FaArrowRight } from 'react-icons/fa';

interface VocabularyPracticeProps {
  selectedWords: VocabularyWord[];
  selectedUserWords: UserVocabularyWord[];
  learnedLanguage: string; // Language name like "German" or "Czech"
  onClose: () => void;
}

type PracticeStage = 'learned_to_english' | 'english_to_learned';

export default function VocabularyPractice({
  selectedWords,
  selectedUserWords,
  learnedLanguage,
  onClose
}: VocabularyPracticeProps) {
  const [stage, setStage] = useState<PracticeStage>('learned_to_english');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [wordsToPractice, setWordsToPractice] = useState<VocabularyWord[]>([]);

  // Combine selected words from both sources
  useEffect(() => {
    const allWords: VocabularyWord[] = [];
    
    // Add words from selectedWords
    allWords.push(...selectedWords);
    
    // Add words from selectedUserWords
    selectedUserWords.forEach(userWord => {
      if (!allWords.find(w => w.id === userWord.vocabulary_word.id)) {
        allWords.push(userWord.vocabulary_word);
      }
    });
    
    setWordsToPractice(allWords);
    setCurrentWordIndex(0);
    setUserInput('');
    setIsChecked(false);
    setIsCorrect(null);
    setCorrectAnswer('');
  }, [selectedWords, selectedUserWords]);

  // Get the translation based on learned language
  const getLearnedLanguageTranslation = (word: VocabularyWord): string => {
    const languageLower = learnedLanguage.toLowerCase();
    if (languageLower.includes('german') || languageLower.includes('deutsch')) {
      return word.german_translation;
    } else if (languageLower.includes('czech') || languageLower.includes('čeština')) {
      return word.czech_translation;
    }
    // Default to German
    return word.german_translation;
  };

  const getCurrentWord = (): VocabularyWord | null => {
    if (wordsToPractice.length === 0) return null;
    return wordsToPractice[currentWordIndex];
  };

  const getQuestionWord = (): string => {
    const word = getCurrentWord();
    if (!word) return '';
    
    if (stage === 'learned_to_english') {
      return getLearnedLanguageTranslation(word);
    } else {
      return word.word; // English word
    }
  };

  const getExpectedAnswer = (): string => {
    const word = getCurrentWord();
    if (!word) return '';
    
    if (stage === 'learned_to_english') {
      return word.word.toLowerCase().trim(); // English word
    } else {
      return getLearnedLanguageTranslation(word).toLowerCase().trim();
    }
  };

  const handleCheck = () => {
    if (!userInput.trim()) return;
    
    const expected = getExpectedAnswer();
    const userAnswer = userInput.toLowerCase().trim();
    const correct = expected === userAnswer;
    
    setIsChecked(true);
    setIsCorrect(correct);
    
    if (!correct) {
      const word = getCurrentWord();
      if (word) {
        setCorrectAnswer(stage === 'learned_to_english' 
          ? word.word
          : getLearnedLanguageTranslation(word));
      }
    }
  };

  const handleNext = () => {
    if (currentWordIndex < wordsToPractice.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setUserInput('');
      setIsChecked(false);
      setIsCorrect(null);
      setCorrectAnswer('');
    } else {
      // Finished all words in current stage, switch to next stage
      if (stage === 'learned_to_english') {
        setStage('english_to_learned');
        setCurrentWordIndex(0);
        setUserInput('');
        setIsChecked(false);
        setIsCorrect(null);
        setCorrectAnswer('');
      } else {
        // Finished both stages
        onClose();
      }
    }
  };

  const getInputBorderClass = (): string => {
    if (!isChecked) return 'border-gray-300';
    if (isCorrect) return 'border-green-500 border-2';
    return 'border-red-500 border-2';
  };

  const questionWord = getQuestionWord();
  const progress = wordsToPractice.length > 0 
    ? ((currentWordIndex + 1) / wordsToPractice.length) * 100 
    : 0;

  if (wordsToPractice.length === 0) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No words selected for practice.</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Vocabulary Practice
            </h1>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
          
          {/* Stage indicator */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                stage === 'learned_to_english' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                Stage 1: {learnedLanguage} → English
              </span>
              <FaArrowRight className="text-gray-400" />
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                stage === 'english_to_learned' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                Stage 2: English → {learnedLanguage}
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Word {currentWordIndex + 1} of {wordsToPractice.length}
            </p>
          </div>
        </div>

        {/* Practice Card */}
        <div className="bg-gray-50 rounded-lg p-8 shadow-lg">
          {/* Question */}
          <div className="mb-8 text-center">
            <p className="text-sm text-gray-600 mb-2">
              {stage === 'learned_to_english' 
                ? `Translate this ${learnedLanguage} word to English:` 
                : `Translate this English word to ${learnedLanguage}:`}
            </p>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              {questionWord}
            </h2>
          </div>

          {/* Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your translation:
            </label>
            <input
              type="text"
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                if (isChecked) {
                  setIsChecked(false);
                  setIsCorrect(null);
                  setCorrectAnswer('');
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isChecked) {
                  handleCheck();
                } else if (e.key === 'Enter' && isChecked) {
                  handleNext();
                }
              }}
              disabled={isChecked}
              className={`w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getInputBorderClass()
              } ${isChecked ? 'bg-gray-100' : 'bg-white'}`}
              placeholder="Type your answer here..."
            />
          </div>

          {/* Correct Answer Display (shown when incorrect) */}
          {isChecked && !isCorrect && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 mb-1">Correct answer:</p>
              <p className="text-lg font-semibold text-red-800">{correctAnswer}</p>
            </div>
          )}

          {/* Success Message */}
          {isChecked && isCorrect && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <FaCheck className="text-green-600 text-xl" />
              <p className="text-lg font-semibold text-green-800">Correct!</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!isChecked ? (
              <button
                onClick={handleCheck}
                disabled={!userInput.trim()}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  !userInput.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {currentWordIndex < wordsToPractice.length - 1 
                  ? 'Next Word' 
                  : stage === 'learned_to_english' 
                    ? 'Start Stage 2' 
                    : 'Finish Practice'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

