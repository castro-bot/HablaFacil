import type { Word } from './Word';

/**
 * Maximum number of words allowed in a sentence
 */
export const MAX_SENTENCE_LENGTH = 20;

/**
 * Sentence entity - represents a collection of words forming a communication
 * Domain entity with no external dependencies (Clean Architecture)
 */
export interface Sentence {
  /** Array of words in the sentence */
  readonly words: ReadonlyArray<Word>;
}

/**
 * Creates an empty sentence
 */
export function createEmptySentence(): Sentence {
  return { words: [] };
}

/**
 * Adds a word to the sentence (immutable operation)
 * Returns a new sentence with the word added
 */
export function addWordToSentence(sentence: Sentence, word: Word): Sentence {
  if (sentence.words.length >= MAX_SENTENCE_LENGTH) {
    return sentence; // Don't exceed max length
  }
  return {
    words: [...sentence.words, word],
  };
}

/**
 * Removes the last word from the sentence (backspace operation)
 */
export function removeLastWord(sentence: Sentence): Sentence {
  if (sentence.words.length === 0) {
    return sentence;
  }
  return {
    words: sentence.words.slice(0, -1),
  };
}

/**
 * Clears all words from the sentence
 */
export function clearSentence(): Sentence {
  return createEmptySentence();
}

/**
 * Converts a sentence to a readable Spanish string
 */
export function sentenceToSpanishText(sentence: Sentence): string {
  return sentence.words.map((word) => word.spanish).join(' ');
}

/**
 * Gets the word count in a sentence
 */
export function getSentenceLength(sentence: Sentence): number {
  return sentence.words.length;
}

/**
 * Checks if the sentence is empty
 */
export function isSentenceEmpty(sentence: Sentence): boolean {
  return sentence.words.length === 0;
}

/**
 * Checks if the sentence has reached max capacity
 */
export function isSentenceFull(sentence: Sentence): boolean {
  return sentence.words.length >= MAX_SENTENCE_LENGTH;
}
