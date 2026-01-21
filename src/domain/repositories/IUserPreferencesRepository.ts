/**
 * User preferences for AAC app customization
 */
export interface UserPreferences {
  /** Selected Spanish voice variant */
  voiceVariant: 'es-ES' | 'es-MX' | 'es-US';

  /** Speech rate (0.5 to 2.0) */
  speechRate: number;

  /** Current selected location filter */
  currentLocationId: string;

  /** Whether to show English translations */
  showTranslations: boolean;

  /** Grid columns preference (2-6) */
  gridColumns: number;

  /** High contrast mode for accessibility */
  highContrastMode: boolean;
}

/**
 * Default user preferences
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  voiceVariant: 'es-MX',
  speechRate: 1.0,
  currentLocationId: 'all',
  showTranslations: true,
  gridColumns: 4,
  highContrastMode: false,
};

/**
 * Repository interface for user preferences storage
 */
export interface IUserPreferencesRepository {
  /**
   * Retrieves user preferences
   * @param userId - Optional user ID for authenticated users
   */
  getPreferences(userId?: string): Promise<UserPreferences>;

  /**
   * Saves user preferences
   * @param preferences - The preferences to save
   * @param userId - Optional user ID for authenticated users
   */
  savePreferences(preferences: UserPreferences, userId?: string): Promise<void>;

  /**
   * Resets preferences to defaults
   * @param userId - Optional user ID for authenticated users
   */
  resetToDefaults(userId?: string): Promise<void>;
}
