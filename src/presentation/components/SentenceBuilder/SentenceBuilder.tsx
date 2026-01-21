import type { Sentence } from '../../../domain/entities';
import { sentenceToSpanishText, isSentenceEmpty, getSentenceLength, MAX_SENTENCE_LENGTH } from '../../../domain/entities';
import { useSpeech } from '../../hooks';

interface SentenceBuilderProps {
  sentence: Sentence;
  onRemoveLastWord: () => void;
  onClear: () => void;
}

/**
 * Sentence builder component - displays and controls the current sentence
 */
export function SentenceBuilder({ sentence, onRemoveLastWord, onClear }: SentenceBuilderProps) {
  const { speak, isSpeaking, stop } = useSpeech();

  const sentenceText = sentenceToSpanishText(sentence);
  const isEmpty = isSentenceEmpty(sentence);
  const wordCount = getSentenceLength(sentence);

  const handleSpeak = async () => {
    if (isEmpty) return;

    if (isSpeaking) {
      stop();
    } else {
      await speak(sentenceText);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-4">
      {/* Sentence display */}
      <div
        className={`
          min-h-[60px] md:min-h-[80px] p-4 rounded-xl mb-4
          flex items-center justify-center flex-wrap gap-2
          ${isEmpty ? 'bg-gray-50' : 'bg-blue-50'}
          transition-colors duration-200
        `}
        role="status"
        aria-live="polite"
        aria-label="Oración actual"
      >
        {isEmpty ? (
          <span className="text-gray-400 text-lg">
            Toca las palabras para crear una oración
          </span>
        ) : (
          <span className="text-xl md:text-2xl font-medium text-gray-800 text-center">
            {sentenceText}
          </span>
        )}
      </div>

      {/* Word count indicator */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">
          {wordCount} / {MAX_SENTENCE_LENGTH} palabras
        </span>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(wordCount / MAX_SENTENCE_LENGTH) * 100}%` }}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {/* Speak Button */}
        <button
          onClick={handleSpeak}
          disabled={isEmpty}
          className={`
            flex-1 flex items-center justify-center gap-2
            py-4 px-6 rounded-xl font-bold text-lg
            transition-all duration-200
            ${isEmpty
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isSpeaking
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
          `}
          aria-label={isSpeaking ? 'Detener' : 'Hablar'}
        >
          {isSpeaking ? (
            <>
              <span className="text-2xl">⏹️</span>
              <span>Detener</span>
            </>
          ) : (
            <>
              <span className="text-2xl">🔊</span>
              <span>Hablar</span>
            </>
          )}
        </button>

        {/* Backspace Button */}
        <button
          onClick={onRemoveLastWord}
          disabled={isEmpty}
          className={`
            flex items-center justify-center
            w-16 h-16 rounded-xl font-bold text-2xl
            transition-all duration-200
            ${isEmpty
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-yellow-500 text-white hover:bg-yellow-600 active:scale-95'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500
          `}
          aria-label="Borrar última palabra"
        >
          ⬅️
        </button>

        {/* Clear Button */}
        <button
          onClick={onClear}
          disabled={isEmpty}
          className={`
            flex items-center justify-center
            w-16 h-16 rounded-xl font-bold text-2xl
            transition-all duration-200
            ${isEmpty
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-red-500 text-white hover:bg-red-600 active:scale-95'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
          `}
          aria-label="Borrar todo"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
