import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  type Word,
  type WordCategory,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_IMAGES
} from '../../../domain/entities';
import { CATEGORY_ICONS, FALLBACK_ICON, ArrowLeft } from '../../utils/categoryIcons';
import { SymbolCard } from './SymbolCard';

interface SymbolGridProps {
  words: Word[];
  onWordClick?: (word: Word) => void;
  showTranslations?: boolean;
  isSearching?: boolean;
}

export function SymbolGrid({
  words,
  onWordClick,
  showTranslations = true,
  isSearching = false,
}: SymbolGridProps) {
  const [activeCategory, setActiveCategory] = useState<WordCategory | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isSearching) setActiveCategory(null);
  }, [isSearching]);

  const handleImageError = useCallback((category: string) => {
    setFailedImages(prev => {
      const next = new Set(prev);
      next.add(category);
      return next;
    });
  }, []);

  const availableCategories = useMemo(() => {
    const catCount = new Map<WordCategory, number>();
    words.forEach(w => {
      catCount.set(w.category, (catCount.get(w.category) || 0) + 1);
    });
    // Sort by word count descending (most words = most relevant)
    return Array.from(catCount.keys()).sort((a, b) =>
      (catCount.get(b) || 0) - (catCount.get(a) || 0)
    );
  }, [words]);

  const currentWords = useMemo(() => {
    if (isSearching) return words;
    if (!activeCategory) return [];
    return words.filter(w => w.category === activeCategory);
  }, [words, activeCategory, isSearching]);

  // --- VISTA 1: MENÚ PRINCIPAL (DASHBOARD) ---
  if (!activeCategory && !isSearching) {
    return (
      <div className="h-full w-full overflow-y-auto custom-scrollbar animate-fadeIn">

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 p-2 min-h-full place-content-center">
          {availableCategories.map((category) => {
            const IconComponent = CATEGORY_ICONS[category] ?? FALLBACK_ICON;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`
                  ${CATEGORY_COLORS[category] || 'bg-gray-100'}
                  relative flex flex-col items-center justify-center
                  aspect-[4/3] md:aspect-square
                  rounded-2xl shadow-sm border-b-4 border-black/5
                  transition-all hover:scale-[1.03] active:scale-95
                  p-2 group overflow-hidden
                `}
              >
                {/* ARASAAC image with Lucide icon fallback */}
                {!failedImages.has(category) ? (
                  <img
                    src={CATEGORY_IMAGES[category]}
                    alt={CATEGORY_LABELS[category]}
                    className="w-16 h-16 md:w-24 md:h-24 object-contain mb-2 drop-shadow-sm transition-transform group-hover:scale-110"
                    onError={() => handleImageError(category)}
                  />
                ) : (
                  <IconComponent className="w-12 h-12 md:w-16 md:h-16 mb-2 text-gray-600 transition-transform group-hover:scale-110" />
                )}

                <span className="text-lg md:text-xl font-bold text-gray-800 text-center leading-tight">
                  {CATEGORY_LABELS[category]}
                </span>

                {/* Word count badge */}
                <span className="absolute top-2 right-2 text-[10px] font-bold text-gray-500 bg-white/50 px-1.5 rounded-md">
                   {words.filter(w => w.category === category).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // --- VISTA 2: DENTRO DE UNA CATEGORÍA ---
  const ActiveIcon = activeCategory ? (CATEGORY_ICONS[activeCategory] ?? FALLBACK_ICON) : FALLBACK_ICON;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {!isSearching && activeCategory && (
        <div className="shrink-0 flex items-center gap-3 mb-2 pb-2 border-b border-gray-100">
          <button
            onClick={() => setActiveCategory(null)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            {!failedImages.has(activeCategory) ? (
              <img
                src={CATEGORY_IMAGES[activeCategory]}
                className="w-8 h-8 object-contain"
                alt=""
                onError={() => handleImageError(activeCategory)}
              />
            ) : (
              <ActiveIcon className="w-6 h-6 text-gray-600" />
            )}
            <h2 className="text-2xl font-bold text-gray-800">
              {CATEGORY_LABELS[activeCategory]}
            </h2>
          </div>
        </div>
      )}

      {/* Word grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
          {currentWords.map((word) => (
            <SymbolCard
              key={word.id}
              word={word}
              onWordClick={onWordClick}
              showTranslation={showTranslations}
            />
          ))}
        </div>

        {currentWords.length === 0 && (
           <div className="h-40 flex items-center justify-center text-gray-400">
             Categoría vacía
           </div>
        )}
      </div>
    </div>
  );
}
