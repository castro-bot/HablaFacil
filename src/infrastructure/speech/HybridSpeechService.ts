import type {
  ISpeechService,
  SpeechOptions,
  VoiceInfo,
} from '../../domain/services/ISpeechService';
import { DEFAULT_SPEECH_OPTIONS } from '../../domain/services/ISpeechService';
import { WebSpeechProvider, getWebSpeechProvider } from './WebSpeechProvider';

/**
 * Hybrid Speech Service that combines multiple TTS providers
 * Priority: Cached Audio > Google Cloud TTS > Web Speech API
 *
 * Following Clean Architecture: Implements domain interface
 * Following Clean Code: Strategy pattern for extensibility
 */
export class HybridSpeechService implements ISpeechService {
  private webSpeechProvider: WebSpeechProvider;
  private audioCache: Map<string, string> = new Map();
  private currentAudio: HTMLAudioElement | null = null;
  private isCurrentlySpeaking: boolean = false;

  constructor() {
    this.webSpeechProvider = getWebSpeechProvider();
  }

  /**
   * Generate cache key for audio
   */
  private getCacheKey(text: string, options: SpeechOptions): string {
    return `${text}_${options.voiceVariant}_${options.rate}`;
  }

  /**
   * Check if audio is cached
   */
  private hasCachedAudio(text: string, options: SpeechOptions): boolean {
    return this.audioCache.has(this.getCacheKey(text, options));
  }

  /**
   * Play cached audio
   */
  private async playCachedAudio(text: string, options: SpeechOptions): Promise<void> {
    const audioUrl = this.audioCache.get(this.getCacheKey(text, options));
    if (!audioUrl) {
      throw new Error('No cached audio found');
    }

    return this.playAudioUrl(audioUrl);
  }

  /**
   * Play audio from URL
   */
  private async playAudioUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stop();

      const audio = new Audio(url);
      this.currentAudio = audio;
      this.isCurrentlySpeaking = true;

      audio.onended = () => {
        this.isCurrentlySpeaking = false;
        this.currentAudio = null;
        resolve();
      };

      audio.onerror = () => {
        this.isCurrentlySpeaking = false;
        this.currentAudio = null;
        reject(new Error('Failed to play audio'));
      };

      audio.play().catch(reject);
    });
  }

  /**
   * Cache audio URL for future use
   */
  cacheAudio(text: string, options: SpeechOptions, audioUrl: string): void {
    this.audioCache.set(this.getCacheKey(text, options), audioUrl);
  }

  /**
   * Speak text using the best available provider
   */
  async speak(text: string, options?: SpeechOptions): Promise<void> {
    const mergedOptions = { ...DEFAULT_SPEECH_OPTIONS, ...options };

    // 1. Try cached audio first
    if (this.hasCachedAudio(text, mergedOptions)) {
      try {
        await this.playCachedAudio(text, mergedOptions);
        return;
      } catch (error) {
        console.warn('Failed to play cached audio, falling back', error);
      }
    }

    // 2. Use Web Speech API as fallback
    // (Google Cloud TTS would be added here in production)
    this.isCurrentlySpeaking = true;
    try {
      await this.webSpeechProvider.speak(text, mergedOptions);
    } finally {
      this.isCurrentlySpeaking = false;
    }
  }

  stop(): void {
    // Stop audio playback
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    // Stop Web Speech API
    this.webSpeechProvider.stop();
    this.isCurrentlySpeaking = false;
  }

  isSpeaking(): boolean {
    return this.isCurrentlySpeaking || this.webSpeechProvider.isSpeaking();
  }

  async isAvailable(): Promise<boolean> {
    // At minimum, Web Speech API should be available
    return this.webSpeechProvider.isAvailable();
  }

  async getAvailableVoices(): Promise<VoiceInfo[]> {
    return this.webSpeechProvider.getAvailableVoices();
  }
}

/**
 * Singleton instance
 */
let hybridSpeechServiceInstance: HybridSpeechService | null = null;

export function getHybridSpeechService(): HybridSpeechService {
  if (!hybridSpeechServiceInstance) {
    hybridSpeechServiceInstance = new HybridSpeechService();
  }
  return hybridSpeechServiceInstance;
}
