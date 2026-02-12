import { useState } from 'react';
import type { Sentence, Word } from '../../../domain/entities';
import { sentenceToSpanishText, isSentenceEmpty } from '../../../domain/entities';
import { useSpeech } from '../../hooks';
import { ActionButton } from '../common';
import { Sparkles, Undo2, Trash2, Volume2 } from 'lucide-react';
import { Hand, Square } from 'lucide-react';

interface SentenceBuilderProps {
  sentence: Sentence;
  onAddWord: (word: Word) => void;
  onRemoveLastWord: () => void;
  onClear: () => void;
}

export function SentenceBuilder({ sentence, onAddWord, onRemoveLastWord, onClear }: SentenceBuilderProps) {
  const { speak, isSpeaking, stop } = useSpeech();
  const [isDragOver, setIsDragOver] = useState(false);
  const isEmpty = isSentenceEmpty(sentence);
  const sentenceText = sentenceToSpanishText(sentence);

  const handleSpeak = async () => {
    if (isEmpty) return;
    isSpeaking ? stop() : await speak(sentenceText);
  };

  // Drag handlers simplificados
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) onAddWord(JSON.parse(data));
    } catch (err) { console.error(err); }
  };

  return (
    <div
      className={`
        bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]
        transition-colors duration-200
        ${isDragOver ? 'bg-blue-50 border-blue-300' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">

        {/* Área de Texto (La Barra) */}
        <div className="flex-1 bg-gray-100 rounded-xl px-4 py-3 min-h-[60px] flex items-center overflow-x-auto whitespace-nowrap">
           {isEmpty ? (
             <span className="text-gray-400 italic flex items-center gap-2 select-none">
               {isDragOver ? (
                  <><Sparkles className="w-4 h-4" /> Suelta aquí</>
                ) : (
                  <><Hand className="w-4 h-4" /> Toca o arrastra imágenes...</>
                )}
             </span>
           ) : (
             <span className="text-xl md:text-2xl font-bold text-gray-800">
               {sentenceText}
             </span>
           )}
        </div>

        {/* Botones de Acción Compactos */}
        <div className="flex gap-2 shrink-0">
          <ActionButton
            onClick={onRemoveLastWord}
            disabled={isEmpty}
            variant="warning"
            icon={<Undo2 className="w-6 h-6" />}
            ariaLabel="Borrar"
            iconOnly
          />
          <ActionButton
            onClick={onClear}
            disabled={isEmpty}
            variant="danger"
            icon={<Trash2 className="w-6 h-6" />}
            ariaLabel="Limpiar"
            iconOnly
          />
          <div className="w-px h-10 bg-gray-300 mx-1"></div> {/* Separador */}
          <button
            onClick={handleSpeak}
            disabled={isEmpty}
            className={`
              h-14 w-14 rounded-full flex items-center justify-center text-2xl shadow-md transition-all
              ${isEmpty
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isSpeaking
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-green-500 hover:bg-green-600 text-white hover:scale-110 active:scale-95'
              }
            `}
          >
            {isSpeaking ? <Square className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}