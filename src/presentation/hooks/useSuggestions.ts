import { useMemo } from 'react';
import type { Word, Sentence } from '../../domain/entities';
import { getSuggestionsForSentence } from '../../domain/entities';

export function useSuggestions(sentence: Sentence, allWords: Word[]) {
  const suggestions = useMemo(() => {
    return getSuggestionsForSentence(sentence.words, allWords);
  }, [sentence.words, allWords]);

  return { suggestions };
}
