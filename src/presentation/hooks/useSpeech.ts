import { useState, useCallback, useEffect, useRef } from 'react';
import { getHybridSpeechService } from '../../infrastructure/speech';
import type { SpeechOptions, VoiceInfo } from '../../domain/services';
import { useAppContext } from '../context/AppContext';

/**
 * Custom hook for text-to-speech functionality
 * Uses useRef for the speech service to avoid stale closure issues
 */
export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<VoiceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get preferences mainly for speech rate and preferred voice
  // Note: we're using a try/catch here because useSpeech might be used outside of AppProvider context in some theoretical cases,
  // though in this app it's always inside. But to be safe if useSpeech is used in top level tests or something.
  // Actually, hooks rule: hooks must be called inside components.
  // We can assume AppProvider is present if used in pages.
  // But let's handle the case just in case? No, keep it simple.
  let preferences: any = {};
  try {
     const context = useAppContext();
     preferences = context.state.preferences;
  } catch (e) {
     // fallback if context not found
  }

  // Use ref to store speech service to avoid dependency issues
  const speechServiceRef = useRef(getHybridSpeechService());

  // Check availability and load voices on mount
  useEffect(() => {
    const checkAvailability = async () => {
      const available = await speechServiceRef.current.isAvailable();
      setIsAvailable(available);

      if (available) {
        const voices = await speechServiceRef.current.getAvailableVoices();
        // Filter mainly to Spanish/English or just return all?
        // Let's filter to Spanish and English to avoid overwhelming the user
        const relevantVoices = voices.filter(v => v.language.startsWith('es') || v.language.startsWith('en'));
        setAvailableVoices(relevantVoices.length > 0 ? relevantVoices : voices);
      }
    };

    checkAvailability();
  }, []);

  /**
   * Speak the given text
   */
  const speak = useCallback(
    async (text: string, options?: SpeechOptions) => {
      if (!text.trim()) return;

      setError(null);
      setIsSpeaking(true);

      try {
        const speakOptions: SpeechOptions = {
            ...options,
            rate: preferences.speechRate || 1.0,
            voiceURI: preferences.selectedVoiceURI || undefined, // Use preference if set
        };
        await speechServiceRef.current.speak(text, speakOptions);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Speech failed';
        setError(errorMessage);
        console.error('Speech error:', err);
      } finally {
        setIsSpeaking(false);
      }
    },
    [preferences.speechRate, preferences.selectedVoiceURI]
  );

  /**
   * Stop current speech
   */
  const stop = useCallback(() => {
    speechServiceRef.current.stop();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isAvailable,
    availableVoices,
    error,
  };
}
