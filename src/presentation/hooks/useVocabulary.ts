import { useState, useEffect, useMemo } from 'react';
import { type Word, WordFrequency, wordBelongsToLocation, validateCategory, validateFrequency } from '../../domain/entities';
// import { SupabaseVocabularyRepository } from '../../infrastructure/supabase'; // Comentamos esto por ahora
import vocabularyData from '../../data/vocabulary.json';

/**
 * Raw vocabulary item from JSON (before transformation)
 */
interface RawVocabularyItem {
  id: string;
  spanish: string;
  english: string;
  category: string;
  locations: string[];
  frequency: string;
  symbolUrl?: string;
  audioUrl?: string;
}

/**
 * Transform raw JSON data to Word entities (for fallback)
 * Uses validation functions for type-safe transformation
 */
function transformToWord(raw: RawVocabularyItem): Word {
  return {
    id: raw.id,
    spanish: raw.spanish,
    english: raw.english,
    category: validateCategory(raw.category),
    locations: raw.locations,
    frequency: validateFrequency(raw.frequency),
    symbolUrl: raw.symbolUrl ?? '',
    audioUrl: raw.audioUrl,
  };
}

// Singleton repository instance (Comentado temporalmente)
// const vocabularyRepository = new SupabaseVocabularyRepository();

/**
 * Custom hook for vocabulary management
 * FORZADO A MODO LOCAL PARA VER PICTOGRAMAS ARASAAC
 */
export function useVocabulary(currentLocationId: string = 'all') {
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'supabase' | 'local' | null>(null);

  // Load vocabulary on mount
  useEffect(() => {
    async function loadVocabulary() {
      setIsLoading(true);
      setError(null);

      try {
        // === MODO DESARROLLO: FORZAR DATOS LOCALES ===
        // Estamos ignorando Supabase a propósito para ver los cambios del JSON
        console.log('🔌 Forzando modo LOCAL para cargar pictogramas ARASAAC...');
        
        // Simular un pequeño delay para que se sienta real (opcional)
        await new Promise(resolve => setTimeout(resolve, 100));

        const words = (vocabularyData as RawVocabularyItem[]).map(transformToWord);
        setAllWords(words);
        setDataSource('local');
        console.log(`✅ Cargadas ${words.length} palabras desde vocabulary.json`);

        /* // --- CÓDIGO ORIGINAL DE SUPABASE (GUARDADO PARA DESPUÉS) ---
        const words = await vocabularyRepository.getAllWords();
        if (words.length > 0) {
          setAllWords(words);
          setDataSource('supabase');
        } else {
          throw new Error('No words in Supabase, using local fallback');
        }
        */

      } catch (err) {
        console.warn('⚠️ Error loading vocabulary:', err);
        // Fallback de seguridad (aunque arriba ya forzamos local)
        const words = (vocabularyData as RawVocabularyItem[]).map(transformToWord);
        setAllWords(words);
        setDataSource('local');
      } finally {
        setIsLoading(false);
      }
    }

    loadVocabulary();
  }, []);

  // Filter words by current location
  const filteredWords = useMemo(() => {
    if (currentLocationId === 'all') {
      return allWords;
    }
    return allWords.filter((word) => wordBelongsToLocation(word, currentLocationId));
  }, [allWords, currentLocationId]);

  // Group words by category
  const wordsByCategory = useMemo(() => {
    const grouped: Record<string, Word[]> = {};

    for (const word of filteredWords) {
      if (!grouped[word.category]) {
        grouped[word.category] = [];
      }
      grouped[word.category].push(word);
    }

    return grouped;
  }, [filteredWords]);

  // Get high-frequency words (core vocabulary)
  const coreWords = useMemo(() => {
    return filteredWords.filter((word) => word.frequency === WordFrequency.HIGH);
  }, [filteredWords]);

  // Search functionality
  const searchWords = (query: string): Word[] => {
    if (!query.trim()) return filteredWords;

    const lowerQuery = query.toLowerCase();
    return filteredWords.filter(
      (word) =>
        word.spanish.toLowerCase().includes(lowerQuery) ||
        word.english.toLowerCase().includes(lowerQuery)
    );
  };

  // Get word by ID
  const getWordById = (id: string): Word | undefined => {
    return allWords.find((word) => word.id === id);
  };

  // Add new word
  const addNewWord = async (word: Omit<Word, 'id'>): Promise<void> => {
    try {
      let newWord: Word;
      if (dataSource === 'supabase') {
        newWord = await vocabularyRepository.addWord(word);
      } else {
        // Mock add for local fallback
        const id = `local_${Date.now()}`;
        newWord = { ...word, id } as Word;
        console.warn('⚠️ Adding word to local state only (not persisted)');
      }

      setAllWords(prev => [newWord, ...prev]);
    } catch (err) {
      console.error('Error adding word:', err);
      throw err;
    }
  };

  return {
    allWords,
    filteredWords,
    wordsByCategory,
    coreWords,
    isLoading,
    error,
    dataSource,
    searchWords,
    getWordById,
    addNewWord,
    totalCount: allWords.length,
    filteredCount: filteredWords.length,
  };
}