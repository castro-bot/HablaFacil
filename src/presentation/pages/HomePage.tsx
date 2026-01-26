import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useVocabulary, useLocations } from '../hooks';
import { SymbolGrid } from '../components/SymbolGrid';
import { SentenceBuilder } from '../components/SentenceBuilder';
import { LocationSelector } from '../components/LocationSelector';
import { AddWordModal } from '../components/AddWordModal';
import { SettingsModal } from '../components/SettingsModal';

/**
 * Main home page component
 */
export function HomePage() {
  const { state, addWord, removeLastWord, clearSentence, setLocation } = useAppContext();
  const { filteredWords, isLoading: vocabLoading, error: vocabError, dataSource, addNewWord, searchWords } = useVocabulary(state.currentLocationId);
  const { locations, isLoading: locationsLoading, error: locationsError } = useLocations();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isLoading = vocabLoading || locationsLoading;
  const hasError = vocabError || locationsError;

  const displayWords = searchTerm ? searchWords(searchTerm) : filteredWords;

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
      {/* Error Banner */}
      {hasError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">⚠️ Error de conexión</p>
          <p className="text-sm">Usando datos locales. {vocabError || locationsError}</p>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  🗣️ HablaFácil
                </h1>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  title="Configuración"
                >
                  ⚙️
                </button>
              </div>

              {/* Mobile Stats/Status */}
              <div className="md:hidden flex items-center gap-2">
                 {dataSource === 'local' && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                    📦 Offline
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1 md:justify-end">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="🔍 Buscar palabra..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-gray-50/50 focus:bg-white transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

               {/* Add Word Button */}
               <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors shadow-sm whitespace-nowrap"
              >
                <span>➕</span>
                <span className="hidden sm:inline">Palabra</span>
              </button>

              <div className="hidden md:flex items-center gap-3">
                {dataSource === 'local' && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                    📦 Offline
                  </span>
                )}
                <span className="text-sm text-gray-500 font-medium">
                  {displayWords.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 pb-[280px] md:pb-[300px]">
        {/* Location Selector (Hide if searching to reduce clutter?) -> User might want to search within location. Keep it. */}
        <section className={`mb-4 transition-all duration-300 ${searchTerm ? 'opacity-50 hover:opacity-100' : ''}`} aria-label="Selector de ubicación">
          <LocationSelector
            locations={locations}
            currentLocationId={state.currentLocationId}
            onLocationChange={setLocation}
          />
        </section>

        {/* Symbol Grid */}
        <section aria-label="Vocabulario">
          {displayWords.length > 0 ? (
            <SymbolGrid
              words={displayWords}
              showTranslations={state.preferences.showTranslations}
              groupByCategory={!searchTerm} // Disable grouping when searching for flat list? Or keep it? Flat list is usually better for search results.
            />
          ) : (
             <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No se encontraron palabras para "{searchTerm}"</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 text-blue-600 hover:underline"
              >
                ¿Quieres agregarla?
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Sentence Builder */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 shadow-lg z-30">
        <div className="max-w-7xl mx-auto">
          <SentenceBuilder
            sentence={state.sentence}
            onAddWord={addWord}
            onRemoveLastWord={removeLastWord}
            onClear={clearSentence}
          />
        </div>
      </footer>

      <AddWordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addNewWord}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
