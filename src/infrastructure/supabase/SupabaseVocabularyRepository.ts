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
  symbol_url: string | null;
  frequency: number;
}

/**
 * Category mapping: Frontend (English) → Database (Spanish)
 * The database uses Spanish category names, frontend uses English
 */
const CATEGORY_TO_DB: Record<string, string> = {
  pronouns: 'pronombres',
  verbs: 'verbos',
  social: 'sociales',
  questions: 'preguntas',
  nouns: 'sustantivos',
  emotions: 'emociones',
  adjectives: 'adjetivos',
  numbers: 'numeros',
  colors: 'colores',
  time: 'tiempo',
  // Additional frontend categories that map to 'sustantivos'
  body: 'sustantivos',
  home: 'sustantivos',
  school: 'sustantivos',
  food: 'sustantivos',
  clothing: 'sustantivos',
  vehicles: 'sustantivos',
  nature: 'sustantivos',
  places: 'sustantivos',
  animals: 'sustantivos',
};

/**
 * Category mapping: Database (Spanish) → Frontend (English)
 */
const DB_TO_CATEGORY: Record<string, string> = {
  pronombres: 'pronouns',
  verbos: 'verbs',
  sociales: 'social',
  preguntas: 'questions',
  sustantivos: 'nouns',
  emociones: 'emotions',
  adjetivos: 'adjectives',
  numeros: 'numbers',
  colores: 'colors',
  tiempo: 'time',
};


export class SupabaseVocabularyRepository implements IVocabularyRepository {
  /**
   * Maps database row (snake_case) to domain entity (camelCase)
   */
  private mapRowToWord(row: WordRow): Word {
    // Map Spanish DB category to English frontend category, fallback to 'nouns'
    const mappedCategory = DB_TO_CATEGORY[row.category] || row.category;
    const category: WordCategory = validateCategory(mappedCategory) ? mappedCategory as WordCategory : 'nouns';

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
   * Includes a timeout to prevent hanging when offline
   */
  async getAllWords(): Promise<Word[]> {
    if (!supabase) return [];

    // Add timeout to prevent hanging when offline
    const timeoutMs = 5000;
    const fetchPromise = supabase
      .from(Tables.WORDS)
      .select('*')
      .order('frequency', { ascending: false });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timed out')), timeoutMs)
    );

    try {
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        console.error('Error fetching words:', error);
        return [];
      }

      return (data as WordRow[]).map(this.mapRowToWord);
    } catch (err) {
      console.warn('⚠️ Supabase fetch timed out or failed:', err);
      return [];
    }
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

    // Map English frontend category to Spanish DB category
    const dbCategory = CATEGORY_TO_DB[word.category] || word.category;

    const row: WordRow = {
      id,
      spanish: word.spanish,
      english: word.english,
      category: dbCategory,
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
