import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration
 * Following Clean Architecture: Infrastructure layer handles external services
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

/**
 * Supabase client instance
 * Use this throughout the application for database operations
 */
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Database table names as constants (avoiding magic strings)
 */
export const Tables = {
  WORDS: 'words',
  LOCATIONS: 'locations',
} as const;
