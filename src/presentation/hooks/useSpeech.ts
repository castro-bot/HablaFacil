import { useState, useCallback, useEffect } from 'react';
import { getHybridSpeechService } from '../../infrastructure/speech';
import type { SpeechOptions, VoiceInfo } from '../../domain/services';

/**
 * Custom hook for text-to-speech functionality
 */
export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<VoiceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const speechService = getHybridSpeechService();

  // Check availability and load voices on mount
  useEffect(() => {
    const checkAvailability = async () => {
      const available = await speechService.isAvailable();
      setIsAvailable(available);

      if (available) {
        const voices = await speechService.getAvailableVoices();
        setAvailableVoices(voices);
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
        await speechService.speak(text, options);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Speech failed';
        setError(errorMessage);
        console.error('Speech error:', err);
      } finally {
        setIsSpeaking(false);
      }
    },
    [speechService]
  );

  /**
   * Stop current speech
   */
  const stop = useCallback(() => {
    speechService.stop();
    setIsSpeaking(false);
  }, [speechService]);

  /**
   * Speak a single word (convenience method)
   */
  const speakWord = useCallback(
    async (spanish: string, options?: SpeechOptions) => {
      await speak(spanish, options);
    },
    [speak]
  );

  return {
    speak,
    speakWord,
    stop,
    isSpeaking,
    isAvailable,
    availableVoices,
    error,
  };
}
