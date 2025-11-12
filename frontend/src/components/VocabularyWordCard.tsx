import type { VocabularyWord } from '../api';

interface VocabularyWordCardProps {
  word: VocabularyWord;
  selectedLanguage: string | null; // Language name like "German" or "Czech"
  learningStatus: number; // 0-100, where 0 = not learned, 100 = fully learned
  isSelectedForLearning?: boolean; // Whether the word is selected for learning
  onClick?: () => void; // Callback when card is clicked
}

export default function VocabularyWordCard({ 
  word, 
  selectedLanguage, 
  learningStatus,
  isSelectedForLearning = false,
  onClick
}: VocabularyWordCardProps) {
  // Calculate background color based on learning status (0-100)
  // 0 = white (rgb(255, 255, 255)), 100 = dark green (rgb(0, 100, 0))
  const getBackgroundColor = (status: number) => {
    // Clamp status between 0 and 100
    const clampedStatus = Math.max(0, Math.min(100, status));
    
    // Calculate RGB values: interpolate from white to dark green
    // White: rgb(255, 255, 255)
    // Dark green: rgb(0, 100, 0)
    const red = Math.round(255 - (clampedStatus / 100) * 255);
    const green = Math.round(255 - (clampedStatus / 100) * 155); // 255 to 100
    const blue = Math.round(255 - (clampedStatus / 100) * 255);
    
    return `rgb(${red}, ${green}, ${blue})`;
  };

  // Get the translation based on selected language
  const getMainTranslation = () => {
    if (!selectedLanguage) {
      // Default to German if no language selected
      return word.german_translation;
    }
    
    const languageLower = selectedLanguage.toLowerCase();
    if (languageLower.includes('german') || languageLower.includes('deutsch')) {
      return word.german_translation;
    } else if (languageLower.includes('czech') || languageLower.includes('čeština')) {
      return word.czech_translation;
    }
    // Default to German
    return word.german_translation;
  };

  const mainTranslation = getMainTranslation();
  const englishTranslation = word.word; // English word

  // Determine border style
  const borderClass = isSelectedForLearning ? 'border-4 border-black' : 'border-2 border-gray-300';

  return (
    <div
      className={`${borderClass} bg-green-500 rounded-lg p-4 transition-all duration-200 hover:shadow-lg relative cursor-pointer`}
      style={{
        backgroundColor: getBackgroundColor(learningStatus)
      }}
      onClick={onClick}
    >
      {/* Level bubble in upper right corner */}
      <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
        {word.level.ABC_value}
      </span>

      {/* Main content - centered */}
      <div className="flex flex-col items-center justify-center text-center min-h-[60px]">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{mainTranslation}</h3>
        <p className="text-base text-gray-700">{englishTranslation}</p>
      </div>
    </div>
  );
}

