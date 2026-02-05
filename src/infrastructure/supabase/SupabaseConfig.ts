import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration
 * Following Clean Architecture: Infrastructure layer handles external services
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Check if Supabase is configured
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase credentials not found. Running in offline mode. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to enable cloud sync.'
  );
}

/**
 * Supabase client instance (null if not configured)
 * Use this throughout the application for database operations
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Database table names as constants (avoiding magic strings)
 */
export const Tables = {
  WORDS: 'words',
  LOCATIONS: 'locations',
} as const;
