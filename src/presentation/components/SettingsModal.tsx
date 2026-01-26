import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useSpeech } from '../hooks/useSpeech';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { state, setPreferences } = useAppContext();
  const { availableVoices } = useSpeech();

  if (!isOpen) return null;

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreferences({ selectedVoiceURI: e.target.value || null });
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences({ speechRate: parseFloat(e.target.value) });
  };

  const currentVoice = state.preferences.selectedVoiceURI || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">⚙️ Configuración</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voz del Sistema ({availableVoices.length} disponibles)
            </label>
            <select
              value={currentVoice}
              onChange={handleVoiceChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white font-sans text-sm"
            >
              <option value="">-- Automático (Español Latino) --</option>
              {availableVoices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} ({voice.language})
                </option>
              ))}
            </select>
             <p className="text-xs text-gray-500 mt-1">
              Selecciona una voz específica o deja en automático.
            </p>
          </div>

          {/* Speech Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Velocidad de voz: {state.preferences.speechRate}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={state.preferences.speechRate}
              onChange={handleRateChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Lento</span>
              <span>Rápido</span>
            </div>
          </div>

           {/* Show Translations */}
           <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Mostrar traducciones (Inglés)
            </label>
            <button
              onClick={() => setPreferences({ showTranslations: !state.preferences.showTranslations })}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                state.preferences.showTranslations ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${
                  state.preferences.showTranslations ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
