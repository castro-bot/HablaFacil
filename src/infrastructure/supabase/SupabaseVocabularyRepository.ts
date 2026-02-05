import type { IVocabularyRepository } from '../../domain/repositories/IVocabularyRepository';
import { type Word, type WordCategory, type WordFrequency, WordFrequency as WF, validateCategory } from '../../domain/entities/Word';
import { supabase, Tables, isSupabaseConfigured } from './SupabaseConfig';

/**
 * Database row type from Supabase (snake_case)
 */
interface WordRow {
  id: string;
  spanish: string;
  english: string;
  category: string;
  location_id: string | null;
  symbol_url: string | null;
  frequency: number;
}

/**
 * Supabase implementation of IVocabularyRepository
 * Following Clean Architecture: Infrastructure implements Domain interfaces
 */
export class SupabaseVocabularyRepository implements IVocabularyRepository {
  /**
   * Maps database row (snake_case) to domain entity (camelCase)
   */
  private mapRowToWord(row: WordRow): Word {
    // Validate category or fallback to 'nouns'
    const category: WordCategory = validateCategory(row.category) ? row.category as WordCategory : 'nouns';

    // Validate frequency (1, 2, or 3) or fallback to LOW (1)
    const validFrequencies = [WF.LOW, WF.MEDIUM, WF.HIGH];
    const frequency: WordFrequency = validFrequencies.includes(row.frequency as WordFrequency)
      ? row.frequency as WordFrequency
      : WF.LOW;

    return {
      id: row.id,
      spanish: row.spanish,
      english: row.english,
      category,
      locationId: row.location_id ?? undefined,
      symbolUrl: row.symbol_url ?? undefined,
      frequency,
    };
  }

  /**
   * Check if Supabase is available
   */
  isAvailable(): boolean {
    return isSupabaseConfigured && supabase !== null;
  }

  /**
   * Retrieves all vocabulary words from Supabase
   */
  async getAllWords(): Promise<Word[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from(Tables.WORDS)
      .select('*')
      .order('frequency', { ascending: false });

    if (error) {
      console.error('Error fetching words:', error);
      return [];
    }

    return (data as WordRow[]).map(this.mapRowToWord);
  }

  /**
   * Retrieves words filtered by location
   */
  async getWordsByLocation(locationId: string): Promise<Word[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from(Tables.WORDS)
      .select('*')
      .or(`location_id.eq.${locationId},location_id.is.null`)
      .order('frequency', { ascending: false });

    if (error) {
      console.error('Error fetching words by location:', error);
      return [];
    }

    return (data as WordRow[]).map(this.mapRowToWord);
  }

  /**
   * Retrieves a single word by its ID
   */
  async getWordById(wordId: string): Promise<Word | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from(Tables.WORDS)
      .select('*')
      .eq('id', wordId)
      .single();

    if (error) {
      console.error('Error fetching word by id:', error);
      return null;
    }

    return data ? this.mapRowToWord(data as WordRow) : null;
  }

  /**
   * Searches words by Spanish text (case-insensitive partial match)
   */
  async searchWords(searchTerm: string): Promise<Word[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from(Tables.WORDS)
      .select('*')
      .ilike('spanish', `%${searchTerm}%`)
      .order('frequency', { ascending: false });

    if (error) {
      console.error('Error searching words:', error);
      return [];
    }

    return (data as WordRow[]).map(this.mapRowToWord);
  }

  async addWord(word: Omit<Word, 'id'>): Promise<Word> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    // Generate a slug-like ID from Spanish text + random suffix to ensure uniqueness
    const slug = word.spanish
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9]/g, '_');

    const id = `${slug}_${Math.random().toString(36).substring(2, 7)}`;

    const row: WordRow = {
      id,
      spanish: word.spanish,
      english: word.english,
      category: word.category,
      location_id: word.locationId ?? null,
      symbol_url: word.symbolUrl ?? null,
      frequency: word.frequency,
    };

    const { data, error } = await supabase
      .from(Tables.WORDS)
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('Error adding word:', error);
      throw error;
    }

    return this.mapRowToWord(data as WordRow);
  }
}
