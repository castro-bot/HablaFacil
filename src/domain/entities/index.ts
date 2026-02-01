export type { Word } from './Word';
export {
  WordCategory,
  WordFrequency,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_COLORS,
  CATEGORY_EMOJIS,
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