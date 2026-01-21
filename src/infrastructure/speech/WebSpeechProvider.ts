import type {
  ISpeechService,
  SpeechOptions,
  VoiceInfo,
} from '../../domain/services/ISpeechService';
import { DEFAULT_SPEECH_OPTIONS } from '../../domain/services/ISpeechService';

/**
 * Web Speech API implementation of ISpeechService
 * Acts as fallback when Google Cloud TTS is unavailable
 */
export class WebSpeechProvider implements ISpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
    }
  }

  /**
   * Load available voices (they may load asynchronously)
   */
  private loadVoices(): void {
    if (!this.synthesis) return;

    // Voices may not be immediately available
    const loadVoicesHandler = () => {
      this.cachedVoices = this.synthesis?.getVoices() ?? [];
    };

    loadVoicesHandler();

    // Some browsers fire an event when voices are loaded
    this.synthesis.addEventListener('voiceschanged', loadVoicesHandler);
  }

  /**
   * Find a Spanish voice matching the requested variant
   */
  private findSpanishVoice(variant: string): SpeechSynthesisVoice | null {
    if (this.cachedVoices.length === 0 && this.synthesis) {
      this.cachedVoices = this.synthesis.getVoices();
    }

    // Priority: exact match, then any Spanish voice
    const exactMatch = this.cachedVoices.find(
      (voice) => voice.lang === variant
    );
    if (exactMatch) return exactMatch;

    // Fallback to any Spanish voice
    const spanishVoice = this.cachedVoices.find((voice) =>
      voice.lang.startsWith('es')
    );
    return spanishVoice ?? null;
  }

  async speak(text: string, options?: SpeechOptions): Promise<void> {
    if (!this.synthesis) {
      console.warn('Web Speech API not available');
      return;
    }

    // Stop any current speech
    this.stop();

    const mergedOptions = { ...DEFAULT_SPEECH_OPTIONS, ...options };
    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice
    const voice = this.findSpanishVoice(mergedOptions.voiceVariant);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = mergedOptions.voiceVariant;

    // Set speech parameters
    utterance.rate = mergedOptions.rate;
    utterance.pitch = mergedOptions.pitch;
    utterance.volume = mergedOptions.volume;

    this.currentUtterance = utterance;

    return new Promise((resolve, reject) => {
      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };
      utterance.onerror = (event) => {
        this.currentUtterance = null;
        // Don't reject on 'interrupted' errors (caused by stop())
        if (event.error !== 'interrupted') {
          reject(new Error(`Speech synthesis error: ${event.error}`));
        } else {
          resolve();
        }
      };

      this.synthesis!.speak(utterance);
    });
  }

  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  isSpeaking(): boolean {
    return this.synthesis?.speaking ?? false;
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.synthesis);
  }

  async getAvailableVoices(): Promise<VoiceInfo[]> {
    if (this.cachedVoices.length === 0 && this.synthesis) {
      this.cachedVoices = this.synthesis.getVoices();
    }

    // Filter to Spanish voices only
    return this.cachedVoices
      .filter((voice) => voice.lang.startsWith('es'))
      .map((voice) => ({
        id: voice.voiceURI,
        name: voice.name,
        language: voice.lang,
        isNeural: voice.name.toLowerCase().includes('neural'),
      }));
  }
}

/**
 * Create a singleton instance
 */
let webSpeechProviderInstance: WebSpeechProvider | null = null;

export function getWebSpeechProvider(): WebSpeechProvider {
  if (!webSpeechProviderInstance) {
    webSpeechProviderInstance = new WebSpeechProvider();
  }
  return webSpeechProviderInstance;
}
