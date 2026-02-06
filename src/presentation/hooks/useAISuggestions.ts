// src/presentation/hooks/useAISuggestions.ts
import { useState, useEffect, useRef, useMemo } from 'react';
import type { Word, Sentence } from '../../domain/entities';
import { getSuggestionsForSentence } from '../../domain/entities';
import { getGeminiSuggestionService } from '../../infrastructure/ai';

interface UseAISuggestionsResult {
  suggestions: Word[];
  isLoading: boolean;
}

// Simple LRU cache to avoid duplicate API calls for same sentence
const suggestionCache = new Map<string, Word[]>();
const MAX_CACHE_SIZE = 20;

function getCacheKey(words: ReadonlyArray<Word>): string {
  return words.map(w => w.id).join('_');
}

function getCachedSuggestions(words: ReadonlyArray<Word>): Word[] | null {
  const key = getCacheKey(words);
  const cached = suggestionCache.get(key);
  return cached !== undefined ? cached : null;
}

function setCachedSuggestions(words: ReadonlyArray<Word>, suggestions: Word[]): void {
  const key = getCacheKey(words);

  // LRU: Remove oldest entry if cache is full
  if (suggestionCache.size >= MAX_CACHE_SIZE) {
    const firstKey = suggestionCache.keys().next().value as string;
    suggestionCache.delete(firstKey);
  }

  suggestionCache.set(key, suggestions);
}

/**
 * Hook for AI-powered word suggestions with debouncing, caching, and fallback to static suggestions
 */
export function useAISuggestions(
  sentence: Sentence,
  allWords: Word[],
  debounceMs = 300
): UseAISuggestionsResult {
  const [aiSuggestions, setAiSuggestions] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentenceLengthRef = useRef(0);

  // Get static suggestions as fallback (memoized)
  const staticSuggestions = useMemo(() => {
    return getSuggestionsForSentence(sentence.words, allWords);
  }, [sentence.words, allWords]);

  // Get AI service (will be null if no API key)
  const aiService = useMemo(() => getGeminiSuggestionService(), []);

  useEffect(() => {
    // Cancel any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // If no sentence or no AI service, use static suggestions
    if (sentence.words.length === 0 || !aiService) {
      setAiSuggestions([]);
      setIsLoading(false);
      return;
    }

    // Check cache first
    const cached = getCachedSuggestions(sentence.words);
    if (cached) {
      setAiSuggestions(cached);
      setIsLoading(false);
      return;
    }

    // Show loading state immediately when sentence changes
    const sentenceChanged = sentence.words.length !== lastSentenceLengthRef.current;
    if (sentenceChanged) {
      setIsLoading(true);
      lastSentenceLengthRef.current = sentence.words.length;
    }

    // Debounce the API call
    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const suggestions = await aiService.getSuggestions(
          sentence.words,
          allWords
        );

        // Only update if not aborted
        if (!controller.signal.aborted) {
          // Cache the result
          if (suggestions.length > 0) {
            setCachedSuggestions(sentence.words, suggestions);
          }
          setAiSuggestions(suggestions);
          setIsLoading(false);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('AI suggestions failed, using static fallback');
          setAiSuggestions([]);
          setIsLoading(false);
        }
      }
    }, debounceMs);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [sentence.words, allWords, aiService, debounceMs]);

  // Use AI suggestions if available, otherwise fall back to static
  const suggestions = aiSuggestions.length > 0 ? aiSuggestions : staticSuggestions;

  return { suggestions, isLoading };
}
