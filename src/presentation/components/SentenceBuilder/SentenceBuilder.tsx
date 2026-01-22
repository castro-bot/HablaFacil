import { useState } from 'react';
import type { Sentence, Word } from '../../../domain/entities';
import { sentenceToSpanishText, isSentenceEmpty, getSentenceLength, MAX_SENTENCE_LENGTH } from '../../../domain/entities';
import { useSpeech } from '../../hooks';
import { ActionButton } from '../common';

interface SentenceBuilderProps {
  sentence: Sentence;
  onAddWord: (word: Word) => void;
  onRemoveLastWord: () => void;
  onClear: () => void;
}

/**
 * Sentence builder component - displays and controls the current sentence
 * Supports drag-and-drop to add words
 */
export function SentenceBuilder({ sentence, onAddWord, onRemoveLastWord, onClear }: SentenceBuilderProps) {
  const { speak, isSpeaking, stop } = useSpeech();
  const [isDragOver, setIsDragOver] = useState(false);

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

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const wordData = e.dataTransfer.getData('application/json');
      if (wordData) {
        const word: Word = JSON.parse(wordData);
        onAddWord(word);
      }
    } catch (error) {
      console.error('Failed to parse dropped word:', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-4">
      {/* Sentence display - Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          min-h-[60px] md:min-h-[80px] p-4 rounded-xl mb-4
          flex items-center justify-center flex-wrap gap-2
          transition-all duration-200 border-2 border-dashed
          ${isDragOver
            ? 'bg-blue-100 border-blue-400 scale-[1.02]'
            : isEmpty
              ? 'bg-gray-50 border-gray-300'
              : 'bg-blue-50 border-transparent'
          }
        `}
        role="status"
        aria-live="polite"
        aria-label="Oración actual - Zona para soltar palabras"
      >
        {isEmpty ? (
          <span className={`text-lg ${isDragOver ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
            {isDragOver ? '¡Suelta aquí para añadir!' : '📥 Arrastra palabras aquí'}
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
        <ActionButton
          onClick={handleSpeak}
          disabled={isEmpty}
          variant={isSpeaking ? 'danger' : 'primary'}
          icon={isSpeaking ? '⏹️' : '🔊'}
          label={isSpeaking ? 'Detener' : 'Hablar'}
          ariaLabel={isSpeaking ? 'Detener' : 'Hablar oración completa'}
        />

        {/* Backspace Button */}
        <ActionButton
          onClick={onRemoveLastWord}
          disabled={isEmpty}
          variant="warning"
          icon="⬅️"
          ariaLabel="Borrar última palabra"
          iconOnly
        />

        {/* Clear Button */}
        <ActionButton
          onClick={onClear}
          disabled={isEmpty}
          variant="danger"
          icon="🗑️"
          ariaLabel="Borrar todo"
          iconOnly
        />
      </div>
    </div>
  );
}
