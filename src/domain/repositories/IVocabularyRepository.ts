import type { Word } from '../entities/Word';

/**
 * Repository interface for vocabulary data access
 * Following Clean Architecture: Domain layer defines interface,
 * Infrastructure layer provides implementation
 */
export interface IVocabularyRepository {
  /**
   * Retrieves all vocabulary words
   */
  getAllWords(): Promise<Word[]>;

  /**
   * Retrieves words filtered by location
   * @param locationId - The location to filter by
   */
  getWordsByLocation(locationId: string): Promise<Word[]>;

  /**
   * Retrieves a single word by its ID
   * @param wordId - The unique word identifier
   */
  getWordById(wordId: string): Promise<Word | null>;

  /**
   * Searches words by Spanish text (partial match)
   * @param searchTerm - The search query
   */
  searchWords(searchTerm: string): Promise<Word[]>;
}
