/**
 * Word Category enum for categorizing vocabulary
 * Following Clean Code: Using enums for related constants
 */
export enum WordCategory {
  VERBOS = 'verbos',
  SUSTANTIVOS = 'sustantivos',
  ADJETIVOS = 'adjetivos',
  PRONOMBRES = 'pronombres',
  PREGUNTAS = 'preguntas',
  SOCIALES = 'sociales',
  NUMEROS = 'numeros',
  COLORES = 'colores',
  TIEMPO = 'tiempo',
  EMOCIONES = 'emociones',
}

/**
 * Word Frequency enum for prioritizing vocabulary display
 */
export enum WordFrequency {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Word entity - represents a vocabulary word in the AAC system
 * Domain entity with no external dependencies (Clean Architecture)
 */
export interface Word {
  /** Unique identifier for the word */
  readonly id: string;

  /** Spanish word or phrase */
  readonly spanish: string;

  /** English translation */
  readonly english: string;

  /** Grammatical/semantic category */
  readonly category: WordCategory;

  /** Location contexts where this word is relevant */
  readonly locations: string[];

  /** URL to the symbol/icon image */
  readonly symbolUrl: string;

  /** Optional URL to pre-cached audio file */
  readonly audioUrl?: string;

  /** Usage frequency for prioritization */
  readonly frequency: WordFrequency;
}

/**
 * Factory function to create a Word entity
 * Ensures all required properties are provided with proper defaults
 */
export function createWord(props: {
  id: string;
  spanish: string;
  english: string;
  category: WordCategory;
  locations?: string[];
  symbolUrl?: string;
  audioUrl?: string;
  frequency?: WordFrequency;
}): Word {
  return {
    id: props.id,
    spanish: props.spanish,
    english: props.english,
    category: props.category,
    locations: props.locations ?? ['all'],
    symbolUrl: props.symbolUrl ?? '',
    audioUrl: props.audioUrl,
    frequency: props.frequency ?? WordFrequency.MEDIUM,
  };
}

/**
 * Predicate to check if a word belongs to a specific location
 */
export function wordBelongsToLocation(word: Word, locationId: string): boolean {
  return word.locations.includes('all') || word.locations.includes(locationId);
}

/**
 * Predicate to check if a word matches a category
 */
export function wordMatchesCategory(word: Word, category: WordCategory): boolean {
  return word.category === category;
}
