// src/domain/entities/index.ts

// 1. Exportamos los TIPOS puros con "export type"
export type { Word, WordCategory } from './Word'; 

// 2. Exportamos los VALORES (Constantes y Clases)
// ¡Fíjate que WordFrequency está AQUÍ abajo, no arriba!
export {
  WordFrequency, // <--- Esto exporta el objeto { HIGH: 3, ... }
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_COLORS,
  CATEGORY_EMOJIS,
  CATEGORY_IMAGES,
  createWord,
  wordBelongsToLocation,
  wordMatchesCategory,
  validateCategory,
  validateFrequency,
} from './Word';

export type { Location, LocationId } from './Location';
export { LocationIds, createLocation } from './Location';
export type { Sentence } from './Sentence';
export {
  MAX_SENTENCE_LENGTH,
  createEmptySentence,
  addWordToSentence,
  removeLastWord,
  clearSentence,
  sentenceToSpanishText,
  getSentenceLength,
  isSentenceEmpty,
  isSentenceFull,
} from './Sentence';

export type { QuickPhraseSection, QuickPhraseGroup } from './QuickPhrase';
export { QUICK_PHRASE_GROUPS } from './QuickPhrase';

export type { SuggestionRule, PhraseTemplate } from './SuggestionEngine';
export { SUGGESTION_RULES, PHRASE_TEMPLATES, getSuggestionsForSentence } from './SuggestionEngine';