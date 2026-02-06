import React, { useCallback } from 'react';
import type { Word } from '../../../domain/entities';
import type { PhraseTemplate } from '../../../domain/entities';
import { CATEGORY_EMOJIS } from '../../../domain/entities';

interface SuggestionBarProps {
  suggestions: Word[];
  phraseTemplates: PhraseTemplate[];
  onSuggestionClick: (word: Word) => void;
  onTemplateClick: (template: PhraseTemplate) => void;
  sentenceIsEmpty: boolean;
  isLoading?: boolean;
}

export const SuggestionBar = React.memo(function SuggestionBar({
  suggestions,
  phraseTemplates,
  onSuggestionClick,
  onTemplateClick,
  sentenceIsEmpty,
  isLoading = false,
}: SuggestionBarProps) {
  const handleSuggestionClick = useCallback(
    (word: Word) => onSuggestionClick(word),
    [onSuggestionClick]
  );

  const handleTemplateClick = useCallback(
    (template: PhraseTemplate) => onTemplateClick(template),
    [onTemplateClick]
  );

  if (sentenceIsEmpty) {
    return (
      <div className="shrink-0 bg-gradient-to-r from-purple-50 to-blue-50 border-t border-purple-100 px-3 py-2">
        <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <span className="text-[10px] text-purple-600 font-bold shrink-0 uppercase tracking-wider">
            Frases:
          </span>
          {phraseTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className="shrink-0 px-3 py-1.5 bg-white rounded-full text-xs font-semibold text-purple-700 border border-purple-200 hover:bg-purple-50 active:scale-95 transition-all shadow-sm"
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading && suggestions.length === 0) {
    return (
      <div className="shrink-0 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-green-600 font-bold shrink-0 uppercase tracking-wider">
            Pensando
          </span>
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="shrink-0 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100 px-3 py-2">
      <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <span className="text-[10px] text-green-600 font-bold shrink-0 uppercase tracking-wider">
          Siguiente:
        </span>
        {suggestions.map((word) => (
          <SuggestionChip key={word.id} word={word} onClick={handleSuggestionClick} />
        ))}
      </div>
    </div>
  );
});

const SuggestionChip = React.memo(function SuggestionChip({
  word,
  onClick,
}: {
  word: Word;
  onClick: (w: Word) => void;
}) {
  const [imageError, setImageError] = React.useState(false);
  const emoji = CATEGORY_EMOJIS[word.category] ?? '💬';
  const showImage = word.symbolUrl && !imageError;

  return (
    <button
      onClick={() => onClick(word)}
      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-semibold text-green-700 border border-green-200 hover:bg-green-50 active:scale-95 transition-all shadow-sm"
    >
      {showImage ? (
        <img
          src={word.symbolUrl}
          alt=""
          className="w-5 h-5 object-contain"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-sm">{emoji}</span>
      )}
      {word.spanish}
    </button>
  );
});
