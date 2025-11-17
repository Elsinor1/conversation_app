import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { VocabularyWord, UserVocabularyWord } from '../api';
import { createVocabularyPracticeSession, updateVocabularyWordScores } from '../api';
import { getStoredToken } from '../auth';
import { FaCheck, FaArrowRight } from 'react-icons/fa';

type PracticeStage = 'learned_to_english' | 'english_to_learned';

interface PracticeLocationState {
  selectedWords: VocabularyWord[];
  selectedUserWords: UserVocabularyWord[];
  learnedLanguage: string;
}

interface WordPerformance {
  wordId: string | number;
  stage1Correct: number; // Count of correct answers in stage 1
  stage1Incorrect: number; // Count of incorrect answers in stage 1
  stage2Correct: number; // Count of correct answers in stage 2
  stage2Incorrect: number; // Count of incorrect answers in stage 2
  currentScore: number; // Current mastery score (0-100)
}

export default function VocabularyPractice() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PracticeLocationState | null;
  
  // Redirect if no state data
  useEffect(() => {
    if (!state || (!state.selectedWords?.length && !state.selectedUserWords?.length)) {
      navigate('/vocabulary', { replace: true });
    }
  }, [state, navigate]);
  
  if (!state || (!state.selectedWords?.length && !state.selectedUserWords?.length)) {
    return null; // Will redirect
  }
  
  const { selectedWords, selectedUserWords, learnedLanguage } = state;
  const [stage, setStage] = useState<PracticeStage>('learned_to_english');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [wordsToPractice, setWordsToPractice] = useState<VocabularyWord[]>([]);
  // Track total time spent in practice session (across both stages)
  const startTimeRef = useRef<number>(Date.now());
  // Track performance for each word during practice
  const [wordPerformance, setWordPerformance] = useState<Map<string | number, WordPerformance>>(new Map());

  // Combine selected words from both sources and initialize performance tracking
  useEffect(() => {
    const allWords: VocabularyWord[] = [];
    const performanceMap = new Map<string | number, WordPerformance>();
    
    // Add words from selectedWords
    allWords.push(...selectedWords);
    
    // Add words from selectedUserWords and initialize their performance tracking
    selectedUserWords.forEach(userWord => {
      const wordId = userWord.vocabulary_word.id;
      if (!allWords.find(w => w.id === wordId)) {
        allWords.push(userWord.vocabulary_word);
      }
      // Initialize performance tracking with current learning_status as starting score
      performanceMap.set(wordId, {
        wordId: userWord.id, // Use UserVocabularyWord ID for updates
        stage1Correct: 0,
        stage1Incorrect: 0,
        stage2Correct: 0,
        stage2Incorrect: 0,
        currentScore: userWord.learning_status || 0
      });
    });
    
    // Also initialize for words that don't have UserVocabularyWord yet
    selectedWords.forEach(word => {
      if (!performanceMap.has(word.id)) {
        // Find corresponding UserVocabularyWord if exists
        const userWord = selectedUserWords.find(uw => uw.vocabulary_word.id === word.id);
        performanceMap.set(word.id, {
          wordId: userWord?.id || word.id,
          stage1Correct: 0,
          stage1Incorrect: 0,
          stage2Correct: 0,
          stage2Incorrect: 0,
          currentScore: userWord?.learning_status || 0
        });
      }
    });
    
    setWordsToPractice(allWords);
    setWordPerformance(performanceMap);
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

  // Calculate new score based on SM-2 inspired algorithm
  const calculateNewScore = (currentScore: number, isCorrect: boolean, stage: PracticeStage): number => {
    // Base increment/decrement values
    const correctIncrement = stage === 'learned_to_english' ? 15 : 20; // Stage 2 is harder, reward more
    const incorrectDecrement = stage === 'learned_to_english' ? 20 : 25; // Stage 2 is harder, penalize more
    
    let newScore = currentScore;
    
    if (isCorrect) {
      // Increase score, but cap at 100
      newScore = Math.min(100, currentScore + correctIncrement);
    } else {
      // Decrease score, but don't go below 0
      newScore = Math.max(0, currentScore - incorrectDecrement);
    }
    
    return newScore;
  };

  const handleCheck = () => {
    if (!userInput.trim()) return;
    
    const expected = getExpectedAnswer();
    const userAnswer = userInput.toLowerCase().trim();
    const correct = expected === userAnswer;
    const word = getCurrentWord();
    
    if (word) {
      // Update performance tracking for this word
      setWordPerformance(prev => {
        const newMap = new Map(prev);
        const wordId = word.id;
        const performance = newMap.get(wordId) || {
          wordId: selectedUserWords.find(uw => uw.vocabulary_word.id === wordId)?.id || wordId,
          stage1Correct: 0,
          stage1Incorrect: 0,
          stage2Correct: 0,
          stage2Incorrect: 0,
          currentScore: selectedUserWords.find(uw => uw.vocabulary_word.id === wordId)?.learning_status || 0
        };
        
        // Update counts and score based on stage
        if (stage === 'learned_to_english') {
          if (correct) {
            performance.stage1Correct++;
          } else {
            performance.stage1Incorrect++;
          }
        } else {
          if (correct) {
            performance.stage2Correct++;
          } else {
            performance.stage2Incorrect++;
          }
        }
        
        // Calculate new score
        performance.currentScore = calculateNewScore(performance.currentScore, correct, stage);
        newMap.set(wordId, performance);
        
        return newMap;
      });
    }
    
    setIsChecked(true);
    setIsCorrect(correct);
    
    if (!correct && word) {
      setCorrectAnswer(stage === 'learned_to_english' 
        ? word.word
        : getLearnedLanguageTranslation(word));
    }
  };

  const handleStageSwitch = (newStage: PracticeStage) => {
    if (stage !== newStage) {
      setStage(newStage);
      setCurrentWordIndex(0);
      setUserInput('');
      setIsChecked(false);
      setIsCorrect(null);
      setCorrectAnswer('');
    }
  };

  const handleNext = async () => {
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
        // Finished both stages - calculate total time and send POST request to save practice session
        const timeLength = Math.floor((Date.now() - startTimeRef.current) / 1000); // Total time in seconds
        const userVocabularyWordIds = selectedUserWords.map(word => word.id);
        
        console.log(`Practice completed in ${timeLength} seconds with ${userVocabularyWordIds.length} words`);
        console.log('Word performance:', Array.from(wordPerformance.entries()));
        
        const token = getStoredToken();
        if (token && userVocabularyWordIds.length > 0) {
          try {
            // Save practice session
            await createVocabularyPracticeSession(token, userVocabularyWordIds, timeLength);
            console.log('Practice session saved successfully');
            
            // Update word scores - prepare score updates
            const scoreUpdates: Array<{ id: string; learning_status: number }> = [];
            wordPerformance.forEach((performance, wordId) => {
              // Find the UserVocabularyWord ID for this word
              const userWord = selectedUserWords.find(uw => uw.vocabulary_word.id === wordId);
              if (userWord) {
                scoreUpdates.push({
                  id: userWord.id,
                  learning_status: performance.currentScore
                });
              }
            });
            
            if (scoreUpdates.length > 0) {
              await updateVocabularyWordScores(token, scoreUpdates);
              console.log('Word scores updated successfully');
            }
          } catch (error) {
            console.error('Failed to save practice session or update scores:', error);
            // Continue navigation even if save fails
          }
        }
        
        navigate('/vocabulary');
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
      <div className="bg-white h-[calc(100vh-4rem)] flex items-center justify-center ml-18">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No words selected for practice.</p>
          <button
            onClick={() => navigate('/vocabulary')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-[calc(100vh-4rem)] flex flex-col ml-18 overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold text-gray-800">
                Vocabulary Practice
              </h1>
              <button
                onClick={() => navigate('/vocabulary')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
            
            {/* Stage indicator */}
            <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => handleStageSwitch('learned_to_english')}
                className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                  stage === 'learned_to_english' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Stage 1: {learnedLanguage} → English
              </button>
              <FaArrowRight className="text-gray-400" />
              <button
                onClick={() => handleStageSwitch('english_to_learned')}
                className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                  stage === 'english_to_learned' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Stage 2: English → {learnedLanguage}
              </button>
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
          <div className="bg-gray-50 rounded-lg p-6 shadow-lg">
            {/* Question */}
            <div className="mb-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              {stage === 'learned_to_english' 
                ? `Translate this ${learnedLanguage} word to English:` 
                : `Translate this English word to ${learnedLanguage}:`}
            </p>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                {questionWord}
              </h2>
            </div>

            {/* Input */}
            <div className="mb-4">
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
              className={`w-full px-4 py-2 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getInputBorderClass()
              } ${isChecked ? 'bg-gray-100' : 'bg-white'}`}
              placeholder="Type your answer here..."
            />
            </div>

            {/* Correct Answer Display (shown when incorrect) */}
            {isChecked && !isCorrect && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 mb-1">Correct answer:</p>
              <p className="text-lg font-semibold text-red-800">{correctAnswer}</p>
            </div>
          )}

            {/* Success Message */}
            {isChecked && isCorrect && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
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
                  className={`flex-1 px-6 py-2 rounded-lg font-semibold transition-colors ${
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
                  className="flex-1 px-6 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
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
    </div>
  );
}

