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
 * Category display labels with emojis (Spanish UI)
 */
export const CATEGORY_LABELS: Record<WordCategory, string> = {
  [WordCategory.VERBOS]: '🏃 Verbos',
  [WordCategory.SUSTANTIVOS]: '📦 Sustantivos',
  [WordCategory.ADJETIVOS]: '✨ Adjetivos',
  [WordCategory.PRONOMBRES]: '👤 Pronombres',
  [WordCategory.PREGUNTAS]: '❓ Preguntas',
  [WordCategory.SOCIALES]: '👋 Sociales',
  [WordCategory.NUMEROS]: '🔢 Números',
  [WordCategory.COLORES]: '🎨 Colores',
  [WordCategory.TIEMPO]: '⏰ Tiempo',
  [WordCategory.EMOCIONES]: '😊 Emociones',
};

/**
 * Category display order for consistent UI rendering
 */
export const CATEGORY_ORDER: WordCategory[] = [
  WordCategory.PRONOMBRES,
  WordCategory.VERBOS,
  WordCategory.SOCIALES,
  WordCategory.PREGUNTAS,
  WordCategory.SUSTANTIVOS,
  WordCategory.EMOCIONES,
  WordCategory.ADJETIVOS,
  WordCategory.NUMEROS,
  WordCategory.COLORES,
  WordCategory.TIEMPO,
];

/**
 * Category color classes for styling (Tailwind)
 */
export const CATEGORY_COLORS: Record<WordCategory, string> = {
  [WordCategory.VERBOS]: 'bg-green-100 border-green-400 hover:bg-green-200',
  [WordCategory.SUSTANTIVOS]: 'bg-yellow-100 border-yellow-400 hover:bg-yellow-200',
  [WordCategory.ADJETIVOS]: 'bg-blue-100 border-blue-400 hover:bg-blue-200',
  [WordCategory.PRONOMBRES]: 'bg-purple-100 border-purple-400 hover:bg-purple-200',
  [WordCategory.PREGUNTAS]: 'bg-pink-100 border-pink-400 hover:bg-pink-200',
  [WordCategory.SOCIALES]: 'bg-orange-100 border-orange-400 hover:bg-orange-200',
  [WordCategory.NUMEROS]: 'bg-cyan-100 border-cyan-400 hover:bg-cyan-200',
  [WordCategory.COLORES]: 'bg-rose-100 border-rose-400 hover:bg-rose-200',
  [WordCategory.TIEMPO]: 'bg-indigo-100 border-indigo-400 hover:bg-indigo-200',
  [WordCategory.EMOCIONES]: 'bg-red-100 border-red-400 hover:bg-red-200',
};

/**
 * Category emoji mapping for symbol placeholders
 */
export const CATEGORY_EMOJIS: Record<WordCategory, string> = {
  [WordCategory.VERBOS]: '🏃',
  [WordCategory.SUSTANTIVOS]: '📦',
  [WordCategory.ADJETIVOS]: '✨',
  [WordCategory.PRONOMBRES]: '👤',
  [WordCategory.PREGUNTAS]: '❓',
  [WordCategory.SOCIALES]: '👋',
  [WordCategory.NUMEROS]: '🔢',
  [WordCategory.COLORES]: '🎨',
  [WordCategory.TIEMPO]: '⏰',
  [WordCategory.EMOCIONES]: '😊',
};

/**
 * Validates and converts a string to WordCategory with fallback
 * Provides runtime type safety for external data (database, JSON)
 */
export function validateCategory(value: string): WordCategory {
  const validCategories = Object.values(WordCategory);
  if (validCategories.includes(value as WordCategory)) {
    return value as WordCategory;
  }
  console.warn(`Invalid category "${value}", defaulting to SUSTANTIVOS`);
  return WordCategory.SUSTANTIVOS;
}

/**
 * Validates and converts a string to WordFrequency with fallback
 */
export function validateFrequency(value: string): WordFrequency {
  const validFrequencies = Object.values(WordFrequency);
  if (validFrequencies.includes(value as WordFrequency)) {
    return value as WordFrequency;
  }
  return WordFrequency.MEDIUM;
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
