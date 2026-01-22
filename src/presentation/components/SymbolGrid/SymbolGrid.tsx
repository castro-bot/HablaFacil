import { type Word, type WordCategory, CATEGORY_LABELS, CATEGORY_ORDER } from '../../../domain/entities';
import { SymbolCard } from './SymbolCard';

interface SymbolGridProps {
  words: Word[];
  onWordClick?: (word: Word) => void;
  showTranslations?: boolean;
  groupByCategory?: boolean;
}

/**
 * Symbol grid component displaying vocabulary words
 */
export function SymbolGrid({
  words,
  onWordClick,
  showTranslations = true,
  groupByCategory = true,
}: SymbolGridProps) {
  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        <p className="text-lg">No hay palabras disponibles</p>
      </div>
    );
  }

  // Group words by category if enabled
  if (groupByCategory) {
    const grouped = new Map<WordCategory, Word[]>();

    for (const word of words) {
      const category = word.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(word);
    }

    // Sort categories by predefined order
    const sortedCategories = CATEGORY_ORDER.filter(
      (cat) => grouped.has(cat) && grouped.get(cat)!.length > 0
    );

    return (
      <div className="space-y-6">
        {sortedCategories.map((category) => (
          <section key={category} aria-labelledby={`category-${category}`}>
            <h2
              id={`category-${category}`}
              className="text-lg font-bold text-gray-700 mb-3 sticky top-0 bg-white/90 backdrop-blur-sm py-2 z-10"
            >
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
              {grouped.get(category)!.map((word) => (
                <SymbolCard
                  key={word.id}
                  word={word}
                  onWordClick={onWordClick}
                  showTranslation={showTranslations}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  // Flat grid without grouping
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
      {words.map((word) => (
        <SymbolCard
          key={word.id}
          word={word}
          onWordClick={onWordClick}
          showTranslation={showTranslations}
        />
      ))}
    </div>
  );
}

