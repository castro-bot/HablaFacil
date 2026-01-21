export type { Word } from './Word';
export { WordCategory, WordFrequency, createWord, wordBelongsToLocation, wordMatchesCategory } from './Word';
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

