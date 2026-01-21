import { useState, useEffect, useMemo } from 'react';
import { type Word, WordCategory, WordFrequency, wordBelongsToLocation } from '../../domain/entities';
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
 * Transform raw JSON data to Word entities
 */
function transformToWord(raw: RawVocabularyItem): Word {
  // Map string frequency to WordFrequency enum
  const frequencyMap: Record<string, WordFrequency> = {
    high: WordFrequency.HIGH,
    medium: WordFrequency.MEDIUM,
    low: WordFrequency.LOW,
  };

  return {
    id: raw.id,
    spanish: raw.spanish,
    english: raw.english,
    category: raw.category as WordCategory,
    locations: raw.locations,
    frequency: frequencyMap[raw.frequency] ?? WordFrequency.MEDIUM,
    symbolUrl: raw.symbolUrl ?? '',
    audioUrl: raw.audioUrl,
  };
}

/**
 * Custom hook for vocabulary management
 * Provides filtering, searching, and categorization
 */
export function useVocabulary(currentLocationId: string = 'all') {
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load vocabulary on mount
  useEffect(() => {
    try {
      const words = (vocabularyData as RawVocabularyItem[]).map(transformToWord);
      setAllWords(words);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load vocabulary');
      setIsLoading(false);
    }
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

  return {
    allWords,
    filteredWords,
    wordsByCategory,
    coreWords,
    isLoading,
    error,
    searchWords,
    getWordById,
    totalCount: allWords.length,
    filteredCount: filteredWords.length,
  };
}
