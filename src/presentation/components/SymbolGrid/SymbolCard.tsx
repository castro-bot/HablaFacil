import type { Word } from '../../../domain/entities';
import { useSpeech } from '../../hooks';

interface SymbolCardProps {
  word: Word;
  onSelect: (word: Word) => void;
  showTranslation?: boolean;
}

/**
 * Individual symbol card for vocabulary grid
 * Large touch target for accessibility (min 44x44px)
 */
export function SymbolCard({ word, onSelect, showTranslation = true }: SymbolCardProps) {
  const { speakWord, isSpeaking } = useSpeech();

  const handleClick = () => {
    // Speak the word and add to sentence
    speakWord(word.spanish);
    onSelect(word);
  };

  // Category-based color mapping
  const categoryColors: Record<string, string> = {
    verbos: 'bg-green-100 border-green-400 hover:bg-green-200',
    sustantivos: 'bg-yellow-100 border-yellow-400 hover:bg-yellow-200',
    adjetivos: 'bg-blue-100 border-blue-400 hover:bg-blue-200',
    pronombres: 'bg-purple-100 border-purple-400 hover:bg-purple-200',
    preguntas: 'bg-pink-100 border-pink-400 hover:bg-pink-200',
    sociales: 'bg-orange-100 border-orange-400 hover:bg-orange-200',
    numeros: 'bg-cyan-100 border-cyan-400 hover:bg-cyan-200',
    colores: 'bg-rose-100 border-rose-400 hover:bg-rose-200',
    tiempo: 'bg-indigo-100 border-indigo-400 hover:bg-indigo-200',
    emociones: 'bg-red-100 border-red-400 hover:bg-red-200',
  };

  const colorClass = categoryColors[word.category] ?? 'bg-gray-100 border-gray-400 hover:bg-gray-200';

  // Simple emoji placeholder for symbol (would be replaced with actual symbols)
  const getWordEmoji = (category: string): string => {
    const emojiMap: Record<string, string> = {
      verbos: '🏃',
      sustantivos: '📦',
      adjetivos: '✨',
      pronombres: '👤',
      preguntas: '❓',
      sociales: '👋',
      numeros: '🔢',
      colores: '🎨',
      tiempo: '⏰',
      emociones: '😊',
    };
    return emojiMap[category] ?? '💬';
  };

  return (
    <button
      onClick={handleClick}
      disabled={isSpeaking}
      className={`
        ${colorClass}
        relative flex flex-col items-center justify-center
        min-h-[80px] md:min-h-[100px] p-3
        rounded-xl border-2 shadow-sm
        transition-all duration-200 ease-in-out
        hover:shadow-md hover:scale-105
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      aria-label={`${word.spanish}, ${word.english}`}
    >
      {/* Symbol placeholder */}
      <span className="text-3xl md:text-4xl mb-1" role="img" aria-hidden="true">
        {getWordEmoji(word.category)}
      </span>

      {/* Spanish word */}
      <span className="text-sm md:text-base font-semibold text-gray-800 text-center leading-tight">
        {word.spanish}
      </span>

      {/* English translation (optional) */}
      {showTranslation && (
        <span className="text-xs text-gray-500 text-center mt-0.5">
          {word.english}
        </span>
      )}

      {/* High frequency indicator */}
      {word.frequency === 'high' && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" title="Core word" />
      )}
    </button>
  );
}
