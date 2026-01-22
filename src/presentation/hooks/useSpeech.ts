import { useState, useCallback, useEffect, useRef } from 'react';
import { getHybridSpeechService } from '../../infrastructure/speech';
import type { SpeechOptions, VoiceInfo } from '../../domain/services';

/**
 * Custom hook for text-to-speech functionality
 * Uses useRef for the speech service to avoid stale closure issues
 */
export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<VoiceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use ref to store speech service to avoid dependency issues
  const speechServiceRef = useRef(getHybridSpeechService());

  // Check availability and load voices on mount
  useEffect(() => {
    const checkAvailability = async () => {
      const available = await speechServiceRef.current.isAvailable();
      setIsAvailable(available);

      if (available) {
        const voices = await speechServiceRef.current.getAvailableVoices();
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
        await speechServiceRef.current.speak(text, options);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Speech failed';
        setError(errorMessage);
        console.error('Speech error:', err);
      } finally {
        setIsSpeaking(false);
      }
    },
    []
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
