import { useState } from 'react';
import { type Word, CATEGORY_COLORS, CATEGORY_EMOJIS } from '../../../domain/entities';
import { useSpeech } from '../../hooks';

interface SymbolCardProps {
  word: Word;
  onWordClick?: (word: Word) => void;
  showTranslation?: boolean;
}

export function SymbolCard({ word, onWordClick, showTranslation = true }: SymbolCardProps) {
  const { speak, isSpeaking } = useSpeech();
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    speak(word.spanish);
    onWordClick?.(word);
  };

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    e.dataTransfer.setData('application/json', JSON.stringify(word));
    e.dataTransfer.effectAllowed = 'copy';
    e.currentTarget.classList.add('opacity-50', 'scale-95');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLButtonElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'scale-95');
  };

  const colorClass = CATEGORY_COLORS[word.category] ?? 'bg-gray-100 border-gray-400 hover:bg-gray-200';
  const emoji = CATEGORY_EMOJIS[word.category] ?? '💬';
  
  // Mostrar imagen si existe URL y no ha dado error
  const showImage = word.symbolUrl && !imageError;

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
        min-h-[110px] md:min-h-[130px] p-2 
        rounded-xl border-2 shadow-sm
        transition-all duration-200 ease-in-out
        hover:shadow-md hover:scale-105
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-grab active:cursor-grabbing
      `}
      aria-label={`${word.spanish}, ${word.english}`}
    >
      <span className="absolute top-1 left-1 text-xs text-gray-500 opacity-60">⋮⋮</span>

      {/* --- AQUÍ ESTÁ LA CLAVE PARA QUE SE VEAN LAS IMÁGENES --- */}
      {showImage ? (
        <img 
          src={word.symbolUrl} 
          alt={word.spanish}
          loading="lazy"
          referrerPolicy="no-referrer" // <--- ESTO EVITA BLOQUEOS 403/404
          onError={() => setImageError(true)}
          className="w-16 h-16 md:w-20 md:h-20 object-contain mb-1 pointer-events-none select-none" 
        />
      ) : (
        <span className="text-3xl md:text-4xl mb-1 select-none" role="img">
          {emoji}
        </span>
      )}

      <span className="text-sm md:text-base font-bold text-gray-900 text-center leading-tight">
        {word.spanish}
      </span>

      {showTranslation && (
        <span className="text-[10px] md:text-xs text-gray-600 text-center mt-0.5 font-medium">
          {word.english}
        </span>
      )}
    </button>
  );
}