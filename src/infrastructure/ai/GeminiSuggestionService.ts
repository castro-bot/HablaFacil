// src/infrastructure/ai/GeminiSuggestionService.ts
import { GoogleGenAI } from '@google/genai';
import type { Word } from '../../domain/entities';

/**
 * Service to get AI-powered word suggestions using Gemini Flash Lite
 */
export class GeminiSuggestionService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Get AI suggestions for the next word based on current sentence
   * @param sentenceWords - Current words in the sentence
   * @param availableWords - All available words in vocabulary
   * @returns Array of suggested Word objects
   */
  async getSuggestions(
    sentenceWords: ReadonlyArray<Word>,
    availableWords: Word[]
  ): Promise<Word[]> {
    if (sentenceWords.length === 0) {
      return [];
    }

    try {
      // Build the current sentence text
      const currentSentence = sentenceWords.map(w => w.spanish).join(' ');

      // Create a compact vocabulary list (just IDs and Spanish words)
      const vocabList = availableWords
        .slice(0, 150) // Limit to avoid token limits
        .map(w => `${w.id}:${w.spanish}`)
        .join(', ');

      const prompt = `Eres un asistente de comunicación aumentativa para hispanohablantes.
El usuario está construyendo una oración y necesita sugerencias para la siguiente palabra.

Oración actual: "${currentSentence}"

Vocabulario disponible (formato id:palabra): ${vocabList}

Responde SOLO con los IDs de las 5 palabras más probables que seguirían naturalmente en esta oración, separados por comas.
Por ejemplo: agua,comida,jugar,dormir,ir

Solo responde con los IDs, sin explicaciones.`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite', // Low latency & high volume model
        contents: prompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 100,
        }
      });

      const text = response.text?.trim() || '';

      // Parse the response - expecting comma-separated word IDs
      const suggestedIds = text
        .split(',')
        .map(id => id.trim().toLowerCase())
        .filter(id => id.length > 0);

      // Map IDs to actual Word objects
      const wordMap = new Map(availableWords.map(w => [w.id.toLowerCase(), w]));
      const suggestions = suggestedIds
        .map(id => wordMap.get(id))
        .filter((w): w is Word => w !== undefined)
        .slice(0, 6); // Limit to 6 suggestions

      return suggestions;
    } catch (error) {
      console.warn('AI suggestion error:', error);
      return [];
    }
  }
}

// Singleton instance
let serviceInstance: GeminiSuggestionService | null = null;

export function getGeminiSuggestionService(): GeminiSuggestionService | null {
  if (!serviceInstance) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
    if (apiKey) {
      serviceInstance = new GeminiSuggestionService(apiKey);
    }
  }
  return serviceInstance;
}
