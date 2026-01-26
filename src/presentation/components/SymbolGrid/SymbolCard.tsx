import { type Word, CATEGORY_COLORS, CATEGORY_EMOJIS } from '../../../domain/entities';
import { useSpeech } from '../../hooks';

interface SymbolCardProps {
  word: Word;
  onWordClick?: (word: Word) => void;
  showTranslation?: boolean;
}

/**
 * Individual symbol card for vocabulary grid
 * - Click: Speaks the word only
 * - Drag: Allows dragging to sentence builder
 */
export function SymbolCard({ word, onWordClick, showTranslation = true }: SymbolCardProps) {
  const { speak, isSpeaking } = useSpeech();

  // Click just speaks the word
  const handleClick = () => {
    speak(word.spanish);
    onWordClick?.(word);
  };

  // Drag start - set word data for drop zone
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    e.dataTransfer.setData('application/json', JSON.stringify(word));
    e.dataTransfer.effectAllowed = 'copy';
    // Add visual feedback
    e.currentTarget.classList.add('opacity-50', 'scale-95');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLButtonElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'scale-95');
  };

  const colorClass = CATEGORY_COLORS[word.category] ?? 'bg-gray-100 border-gray-400 hover:bg-gray-200';
  const emoji = CATEGORY_EMOJIS[word.category] ?? '💬';

  return (
    <button
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
        cursor-grab active:cursor-grabbing
      `}
      aria-label={`${word.spanish}, ${word.english}. Arrastra para añadir a la oración.`}
      title="Haz clic para escuchar, arrastra para añadir a la oración"
    >
      {/* Drag indicator */}
      <span className="absolute top-1 left-1 text-xs text-gray-400 opacity-60">⋮⋮</span>

      {/* Symbol Image or Fallback Emoji */}
      {word.symbolUrl ? (
        <img
          src={word.symbolUrl}
          alt=""
          className="w-16 h-16 md:w-20 md:h-20 object-contain mb-1 drop-shadow-sm transition-transform group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}

      {/* Fallback Emoji (hidden if image loads successfully) */}
      <span
        className={`text-3xl md:text-4xl mb-1 ${word.symbolUrl ? 'hidden' : ''}`}
        role="img"
        aria-hidden="true"
      >
        {emoji}
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
