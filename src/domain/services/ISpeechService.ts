/**
 * Speech service interface for Text-to-Speech functionality
 * Following Clean Architecture: Domain defines interface,
 * Infrastructure provides implementation (Google TTS, Web Speech API)
 */
export interface ISpeechService {
  /**
   * Speaks the given text using TTS
   * @param text - The Spanish text to speak
   * @param options - Optional speech configuration
   */
  speak(text: string, options?: SpeechOptions): Promise<void>;

  /**
   * Stops any currently playing speech
   */
  stop(): void;

  /**
   * Checks if the speech service is currently speaking
   */
  isSpeaking(): boolean;

  /**
   * Checks if the speech service is available
   */
  isAvailable(): Promise<boolean>;

  /**
   * Gets available Spanish voice options
   */
  getAvailableVoices(): Promise<VoiceInfo[]>;
}

/**
 * Options for speech synthesis
 */
export interface SpeechOptions {
  /** Voice variant (es-ES, es-MX, es-US) */
  voiceVariant?: 'es-ES' | 'es-MX' | 'es-US';

  /** Speech rate (0.5 to 2.0, default 1.0) */
  rate?: number;

  /** Pitch (0.5 to 2.0, default 1.0) */
  pitch?: number;

  /** Volume (0 to 1, default 1) */
  volume?: number;
}

/**
 * Information about an available voice
 */
export interface VoiceInfo {
  /** Voice identifier */
  id: string;

  /** Display name */
  name: string;

  /** Language code */
  language: string;

  /** Whether this is a neural/premium voice */
  isNeural: boolean;
}

/**
 * Default speech options
 */
export const DEFAULT_SPEECH_OPTIONS: Required<SpeechOptions> = {
  voiceVariant: 'es-MX',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};
