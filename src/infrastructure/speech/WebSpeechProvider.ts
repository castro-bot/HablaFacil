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
  private voicesLoaded: Promise<void>;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.voicesLoaded = this.loadVoices();
    } else {
      this.voicesLoaded = Promise.resolve();
    }
  }

  /**
   * Load available voices (they may load asynchronously in some browsers)
   */
  private loadVoices(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synthesis) {
        resolve();
        return;
      }

      const loadVoicesHandler = () => {
        this.cachedVoices = this.synthesis?.getVoices() ?? [];
        if (this.cachedVoices.length > 0) {
          console.log(`🎤 Loaded ${this.cachedVoices.length} voices. Spanish voices:`,
            this.cachedVoices.filter(v => v.lang.startsWith('es')).map(v => `${v.name} (${v.lang})`)
          );
          resolve();
        }
      };

      // Try loading immediately
      loadVoicesHandler();

      // If no voices yet, wait for the voiceschanged event
      if (this.cachedVoices.length === 0) {
        this.synthesis.addEventListener('voiceschanged', loadVoicesHandler, { once: true });
        // Fallback timeout in case the event never fires
        setTimeout(() => {
          loadVoicesHandler();
          resolve();
        }, 1000);
      }
    });
  }

  /**
   * Find the best Spanish voice, prioritizing:
   * 1. Latin American Spanish voices (es-MX preferred, es-US last)
   * 2. Natural/Neural voices
   * 3. Any Spanish voice (excluding Spain Spanish es-ES if possible)
   */
  private findSpanishVoice(variant: string): SpeechSynthesisVoice | null {
    if (this.cachedVoices.length === 0 && this.synthesis) {
      this.cachedVoices = this.synthesis.getVoices();
    }

    const spanishVoices = this.cachedVoices.filter((voice) =>
      voice.lang.startsWith('es')
    );

    if (spanishVoices.length === 0) {
      console.warn('⚠️ No Spanish voices found! Available voices:',
        this.cachedVoices.map(v => `${v.name} (${v.lang})`).slice(0, 10)
      );
      return null;
    }

    // Latin American voice priority (es-MX is most natural, es-US last as it often sounds robotic)
    const latamPriority = ['es-MX', 'es-419', 'es-AR', 'es-CO', 'es-CL', 'es-PE', 'es-US'];

    // Priority 1: Find best Latin American voice by priority order
    for (const lang of latamPriority) {
      const voice = spanishVoices.find((v) => v.lang === lang);
      if (voice) {
        // Within same lang, prefer natural/neural voices
        const naturalVoice = spanishVoices.find(
          (v) => v.lang === lang &&
          (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('neural'))
        );
        if (naturalVoice) {
          console.log(`✅ Using natural Latin American voice: ${naturalVoice.name} (${naturalVoice.lang})`);
          return naturalVoice;
        }
        console.log(`✅ Using Latin American voice: ${voice.name} (${voice.lang})`);
        return voice;
      }
    }

    // Priority 2: Any natural/neural Spanish voice (even Spain Spanish is better than robotic)
    const naturalVoice = spanishVoices.find((voice) =>
      voice.name.toLowerCase().includes('natural') ||
      voice.name.toLowerCase().includes('neural') ||
      voice.name.toLowerCase().includes('premium')
    );
    if (naturalVoice) {
      console.log(`✅ Using natural voice: ${naturalVoice.name} (${naturalVoice.lang})`);
      return naturalVoice;
    }

    // Priority 3: Any Spanish voice except es-ES (Spain) if there are alternatives
    const nonSpainVoice = spanishVoices.find((voice) => voice.lang !== 'es-ES');
    if (nonSpainVoice) {
      console.log(`✅ Using Spanish voice: ${nonSpainVoice.name} (${nonSpainVoice.lang})`);
      return nonSpainVoice;
    }

    // Priority 4: Fallback to any Spanish voice
    console.log(`✅ Using fallback Spanish voice: ${spanishVoices[0].name} (${spanishVoices[0].lang})`);
    return spanishVoices[0];
  }

  async speak(text: string, options?: SpeechOptions): Promise<void> {
    if (!this.synthesis) {
      console.warn('Web Speech API not available');
      return;
    }

    // Wait for voices to be loaded
    await this.voicesLoaded;

    // Stop any current speech
    this.stop();

    const mergedOptions = { ...DEFAULT_SPEECH_OPTIONS, ...options };
    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice (this is critical for proper Spanish pronunciation)
    const voice = this.findSpanishVoice(mergedOptions.voiceVariant);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang; // Use the actual voice language
    } else {
      // Force Spanish language even without a specific voice
      utterance.lang = mergedOptions.voiceVariant;
    }

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
    await this.voicesLoaded;

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
        isNeural: voice.name.toLowerCase().includes('neural') ||
                  voice.name.toLowerCase().includes('natural'),
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
