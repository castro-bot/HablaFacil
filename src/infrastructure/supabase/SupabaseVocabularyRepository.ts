import type { IVocabularyRepository } from '../../domain/repositories/IVocabularyRepository';
import { type Word, validateCategory, validateFrequency } from '../../domain/entities/Word';
import { supabase, Tables } from './SupabaseConfig';

/**
 * Database row type from Supabase (snake_case)
 */
interface WordRow {
  id: string;
  spanish: string;
  english: string;
  category: string;
  locations: string[];
  symbol_url: string;
  audio_url: string | null;
  frequency: string;
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
    return {
      id: row.id,
      spanish: row.spanish,
      english: row.english,
      category: validateCategory(row.category),
      locations: row.locations ?? ['all'],
      symbolUrl: row.symbol_url ?? '',
      audioUrl: row.audio_url ?? undefined,
      frequency: validateFrequency(row.frequency),
    };
  }

  /**
   * Retrieves all vocabulary words from Supabase
   */
  async getAllWords(): Promise<Word[]> {
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
    const { data, error } = await supabase
      .from(Tables.WORDS)
      .select('*')
      .or(`locations.cs.{${locationId}},locations.cs.{all}`)
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
}
