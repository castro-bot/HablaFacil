import { useMemo } from 'react';
import type { Word } from '../../domain/entities';
import { QUICK_PHRASE_GROUPS } from '../../domain/entities';

export function useQuickPhrases(allWords: Word[]) {
  const groups = useMemo(() => {
    const wordMap = new Map(allWords.map(w => [w.id, w]));

    return QUICK_PHRASE_GROUPS.map(group => ({
      ...group,
      words: group.wordIds
        .map(id => wordMap.get(id))
        .filter((w): w is Word => w !== undefined),
    }));
  }, [allWords]);

  return { groups };
}
