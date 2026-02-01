import { useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { useVocabulary, useSuggestions, useQuickPhrases } from '../hooks';
import { useSpeech } from '../hooks';
import { SymbolGrid } from '../components/SymbolGrid';
import { SentenceBuilder } from '../components/SentenceBuilder';
import { AddWordModal } from '../components/AddWordModal';
import { SettingsModal } from '../components/SettingsModal';
import { QuickPhrasesSidebar } from '../components/QuickPhrasesSidebar';
import { SuggestionBar } from '../components/SuggestionBar';
import { isSentenceEmpty, PHRASE_TEMPLATES } from '../../domain/entities';
import type { Word } from '../../domain/entities';
import type { PhraseTemplate } from '../../domain/entities';

/**
 * Main home page component
 */
export function HomePage() {
  const { state, addWord, addMultipleWords, removeLastWord, clearSentence } = useAppContext();

  const { filteredWords, isLoading, error: vocabError, dataSource, addNewWord, searchWords } = useVocabulary(state.currentLocationId);
  const { speak } = useSpeech();
  const { groups: quickPhraseGroups } = useQuickPhrases(filteredWords);
  const { suggestions } = useSuggestions(state.sentence, filteredWords);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Logica de busqueda
  const displayWords = searchTerm ? searchWords(searchTerm) : filteredWords;

  const handleQuickPhraseClick = useCallback((word: Word) => {
    addWord(word);
    speak(word.spanish);
  }, [addWord, speak]);

  const handleSuggestionClick = useCallback((word: Word) => {
    addWord(word);
    speak(word.spanish);
  }, [addWord, speak]);

  const handleTemplateClick = useCallback((template: PhraseTemplate) => {
    const wordMap = new Map(filteredWords.map(w => [w.id, w]));
    const words = template.prefixWordIds
      .map(id => wordMap.get(id))
      .filter((w): w is Word => w !== undefined);
    if (words.length > 0) {
      clearSentence();
      addMultipleWords(words);
    }
  }, [filteredWords, clearSentence, addMultipleWords]);

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
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">

      {/* HEADER */}
      <header className="shrink-0 bg-white shadow-sm z-20">
        <div className="max-w-7xl mx-auto px-4 py-2 md:py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

            {/* Logo y Configuracion */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 select-none">
                  HablaFacil
                </h1>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                  title="Configuracion"
                >
                  ⚙️
                </button>
              </div>

              {/* Indicador Offline (Movil) */}
              <div className="md:hidden">
                 {dataSource === 'local' && (
                  <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold border border-yellow-200">
                    OFFLINE
                  </span>
                )}
              </div>
            </div>

            {/* Barra de Busqueda */}
            <div className="flex items-center gap-3 flex-1 md:justify-end">
              <div className="relative flex-1 max-w-md group">
                <input
                  type="text"
                  placeholder="Buscar palabra..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  🔍
                </span>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

               {/* Boton Crear */}
               <button
                onClick={() => setIsAddModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-xl font-medium transition-all shadow-sm"
              >
                <span>➕</span>
                <span>Crear</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {vocabError && (
        <div className="shrink-0 bg-red-50 border-b border-red-100 px-4 py-2 text-center text-red-600 text-sm">
          ⚠️ Modo sin conexion: {vocabError}
        </div>
      )}

      {/* AREA CENTRAL: Sidebar + Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Quick Phrases Sidebar (vertical en desktop, horizontal en mobile) */}
        <QuickPhrasesSidebar
          groups={quickPhraseGroups}
          onWordClick={handleQuickPhraseClick}
        />

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto h-full flex flex-col">

            <section className="flex-1 min-h-0" aria-label="Vocabulario">
              <SymbolGrid
                words={displayWords}
                showTranslations={state.preferences.showTranslations}
                isSearching={!!searchTerm}
              />

              {searchTerm && displayWords.length === 0 && (
                 <div className="text-center py-12 bg-white/50 rounded-2xl border-2 border-dashed border-gray-200 mt-4">
                  <p className="text-gray-500 text-lg mb-2">No encontramos "{searchTerm}"</p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    + Crear nueva palabra
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* SUGGESTION BAR */}
      <SuggestionBar
        suggestions={suggestions}
        phraseTemplates={PHRASE_TEMPLATES}
        onSuggestionClick={handleSuggestionClick}
        onTemplateClick={handleTemplateClick}
        sentenceIsEmpty={isSentenceEmpty(state.sentence)}
      />

      {/* Sentence Builder - Fixed at bottom */}
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
    </div>
  );
}
