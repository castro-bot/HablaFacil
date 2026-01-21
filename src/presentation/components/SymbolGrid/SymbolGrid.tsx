import type { Word } from '../../../domain/entities';
import { SymbolCard } from './SymbolCard';

interface SymbolGridProps {
  words: Word[];
  onWordSelect: (word: Word) => void;
  showTranslations?: boolean;
  groupByCategory?: boolean;
}

/**
 * Category display names in Spanish
 */
const CATEGORY_LABELS: Record<string, string> = {
  verbos: '🏃 Verbos',
  sustantivos: '📦 Sustantivos',
  adjetivos: '✨ Adjetivos',
  pronombres: '👤 Pronombres',
  preguntas: '❓ Preguntas',
  sociales: '👋 Sociales',
  numeros: '🔢 Números',
  colores: '🎨 Colores',
  tiempo: '⏰ Tiempo',
  emociones: '😊 Emociones',
};

/**
 * Category display order
 */
const CATEGORY_ORDER: string[] = [
  'pronombres',
  'verbos',
  'sociales',
  'preguntas',
  'sustantivos',
  'emociones',
  'adjetivos',
  'numeros',
  'colores',
  'tiempo',
];

/**
 * Symbol grid component displaying vocabulary words
 */
export function SymbolGrid({
  words,
  onWordSelect,
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
    const grouped: Record<string, Word[]> = {};

    for (const word of words) {
      const category = word.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(word);
    }

    // Sort categories by predefined order
    const sortedCategories = CATEGORY_ORDER.filter(
      (cat) => grouped[cat] && grouped[cat].length > 0
    );

    return (
      <div className="space-y-6">
        {sortedCategories.map((category) => (
          <section key={category} aria-labelledby={`category-${category}`}>
            <h2
              id={`category-${category}`}
              className="text-lg font-bold text-gray-700 mb-3 sticky top-0 bg-white/90 backdrop-blur-sm py-2 z-10"
            >
              {CATEGORY_LABELS[category] ?? category}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
              {grouped[category].map((word) => (
                <SymbolCard
                  key={word.id}
                  word={word}
                  onSelect={onWordSelect}
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
          onSelect={onWordSelect}
          showTranslation={showTranslations}
        />
      ))}
    </div>
  );
}
