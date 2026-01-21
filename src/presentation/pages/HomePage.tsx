import { useAppContext } from '../context/AppContext';
import { useVocabulary, useLocations } from '../hooks';
import { SymbolGrid } from '../components/SymbolGrid';
import { SentenceBuilder } from '../components/SentenceBuilder';
import { LocationSelector } from '../components/LocationSelector';

/**
 * Main home page component
 */
export function HomePage() {
  const { state, addWord, removeLastWord, clearSentence, setLocation } = useAppContext();
  const { filteredWords, isLoading: vocabLoading } = useVocabulary(state.currentLocationId);
  const { locations, isLoading: locationsLoading } = useLocations();

  const isLoading = vocabLoading || locationsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-lg text-gray-600">Cargando vocabulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              🗣️ HablaFácil
            </h1>
            <span className="text-sm text-gray-500">
              {filteredWords.length} palabras
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 pb-[280px] md:pb-[300px]">
        {/* Location Selector */}
        <section className="mb-4" aria-label="Selector de ubicación">
          <LocationSelector
            locations={locations}
            currentLocationId={state.currentLocationId}
            onLocationChange={setLocation}
          />
        </section>

        {/* Symbol Grid */}
        <section aria-label="Vocabulario">
          <SymbolGrid
            words={filteredWords}
            onWordSelect={addWord}
            showTranslations={state.preferences.showTranslations}
            groupByCategory={true}
          />
        </section>
      </main>

      {/* Sentence Builder - Fixed at bottom */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 shadow-lg z-30">
        <div className="max-w-7xl mx-auto">
          <SentenceBuilder
            sentence={state.sentence}
            onRemoveLastWord={removeLastWord}
            onClear={clearSentence}
          />
        </div>
      </footer>
    </div>
  );
}
