import { useState, useMemo, useEffect } from 'react';
import { 
  type Word, 
  type WordCategory, 
  CATEGORY_LABELS, 
  CATEGORY_COLORS, 
  CATEGORY_IMAGES, // <--- IMPORTANTE: Importar esto
  CATEGORY_ORDER 
} from '../../../domain/entities';
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

  useEffect(() => {
    if (isSearching) setActiveCategory(null);
  }, [isSearching]);

  const availableCategories = useMemo(() => {
    const cats = new Set<WordCategory>();
    words.forEach(w => cats.add(w.category));
    return CATEGORY_ORDER.filter(c => cats.has(c));
  }, [words]);

  const currentWords = useMemo(() => {
    if (isSearching) return words;
    if (!activeCategory) return [];
    return words.filter(w => w.category === activeCategory);
  }, [words, activeCategory, isSearching]);

  // --- VISTA 1: MENÚ PRINCIPAL (DASHBOARD) ---
  if (!activeCategory && !isSearching) {
    return (
      // CLAVE: h-full y content-center centra todo verticalmente. overflow-y-auto solo si es estrictamente necesario.
      <div className="h-full w-full flex flex-col justify-center animate-fadeIn">
        
        {/* Grid Responsive Ajustado: Más columnas en pantallas grandes para evitar scroll */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 p-2">
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`
                ${CATEGORY_COLORS[category] || 'bg-gray-100'}
                relative flex flex-col items-center justify-center
                aspect-[4/3] md:aspect-square  /* Hace las tarjetas un poco más rectangulares en móvil para ahorrar espacio */
                rounded-2xl shadow-sm border-b-4 border-black/5
                transition-all hover:scale-[1.03] active:scale-95
                p-2 group overflow-hidden
              `}
            >
              {/* IMAGEN ARASAAC */}
              <img 
                src={CATEGORY_IMAGES[category]} 
                alt={CATEGORY_LABELS[category]}
                className="w-16 h-16 md:w-24 md:h-24 object-contain mb-2 drop-shadow-sm transition-transform group-hover:scale-110"
                onError={(e) => {
                  // Fallback si falla la imagen: ocultarla y mostrar texto grande? 
                  // Por ahora simplemente la ocultamos si falla
                  (e.target as HTMLImageElement).style.display = 'none'; 
                }}
              />
              
              <span className="text-lg md:text-xl font-bold text-gray-800 text-center leading-tight">
                {CATEGORY_LABELS[category]}
              </span>
              
              {/* Contador pequeño */}
              <span className="absolute top-2 right-2 text-[10px] font-bold text-gray-500 bg-white/50 px-1.5 rounded-md">
                 {words.filter(w => w.category === category).length}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- VISTA 2: DENTRO DE UNA CATEGORÍA ---
  return (
    <div className="flex flex-col h-full">
      {/* Cabecera compacta */}
      {!isSearching && activeCategory && (
        <div className="shrink-0 flex items-center gap-3 mb-2 pb-2 border-b border-gray-100">
          <button 
            onClick={() => setActiveCategory(null)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <span className="text-2xl font-bold">⬅</span>
          </button>
          
          <div className="flex items-center gap-2">
            <img src={CATEGORY_IMAGES[activeCategory]} className="w-8 h-8 object-contain" alt="" />
            <h2 className="text-2xl font-bold text-gray-800">
              {CATEGORY_LABELS[activeCategory]}
            </h2>
          </div>
        </div>
      )}

      {/* Grid de Palabras (Este sí puede tener scroll si hay muchas) */}
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