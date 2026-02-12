import React, { useState, useRef, useEffect } from 'react';
import {
  type Word,
  type WordCategory,
  WordFrequency,
  CATEGORY_LABELS
} from '../../domain/entities';
import { Sparkles, X, Search, Loader } from '../utils/categoryIcons';
import { CATEGORY_ICONS, FALLBACK_ICON } from '../utils/categoryIcons';
import { ChevronDown } from 'lucide-react';

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (word: Omit<Word, 'id'>) => Promise<void>;
  availableCategories?: WordCategory[];
}

export function AddWordModal({ isOpen, onClose, onAdd, availableCategories }: AddWordModalProps) {
  const [spanish, setSpanish] = useState('');
  const [english, setEnglish] = useState('');
  // Inicializamos con el valor de texto 'nouns' directamente
  const [category, setCategory] = useState<WordCategory>('nouns');
  const [symbolUrl, setSymbolUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const [imageResults, setImageResults] = useState<{ id: string; url: string; label: string }[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isCategoryOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCategoryOpen]);

  if (!isOpen) return null;

  const handleSearchImages = async () => {
    if (!spanish) return;
    setIsSearchingImages(true);
    setImageResults([]);
    try {
      const response = await fetch(
        `https://symbotalkapiv1.azurewebsites.net/search/?name=${encodeURIComponent(spanish)}&lang=es&repo=all&limit=8`
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        const results = data.map((item: any) => ({
          id: item.id?.toString() || Math.random().toString(),
          url: item.link || item.url || '',
          label: item.name
        })).filter(item => item.url);
        setImageResults(results);
      }
    } catch (error) {
      console.error('Error searching images:', error);
      alert('Error buscando símbolos');
    } finally {
      setIsSearchingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAdd({
        spanish,
        english,
        category,
        // --- CORRECCIÓN AQUÍ ---
        // Cambiamos "locations: ['all']" por "locationId: 'all'" para coincidir con tu archivo Word.ts
        locationId: 'all',
        // -----------------------
        symbolUrl: symbolUrl || `https://ui-avatars.com/api/?name=${spanish}&background=random`,
        frequency: WordFrequency.MEDIUM,
      });
      onClose();

      // Reset form
      setSpanish('');
      setEnglish('');
      setCategory('nouns');
      setSymbolUrl('');
      setImageResults([]);
    } catch (error) {
      console.error(error);
      alert('Error al agregar la palabra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Agregar Nueva Palabra
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Palabra en Español *
            </label>
            <input
              required
              type="text"
              value={spanish}
              onChange={(e) => setSpanish(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Ej: Gato"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Traduccion (Ingles) <span className="text-gray-400 font-normal">(Opcional)</span>
            </label>
            <input
              type="text"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Ej: Cat"
            />
          </div>

          <div className="relative" ref={categoryDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-left"
            >
              {(() => {
                const Icon = CATEGORY_ICONS[category] ?? FALLBACK_ICON;
                return <Icon className="w-4 h-4 text-gray-600 shrink-0" />;
              })()}
              <span className="flex-1 text-gray-800">{CATEGORY_LABELS[category]}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCategoryOpen && (
              <div
                className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              >
                {Object.entries(CATEGORY_LABELS)
                  .filter(([key]) => !availableCategories || availableCategories.includes(key as WordCategory))
                  .map(([key, label]) => {
                    const Icon = CATEGORY_ICONS[key as WordCategory] ?? FALLBACK_ICON;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setCategory(key as WordCategory);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${
                          category === key ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {label}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL del Símbolo (Opcional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={symbolUrl}
                onChange={(e) => setSymbolUrl(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="https://example.com/image.png"
              />
              <button
                type="button"
                onClick={handleSearchImages}
                disabled={!spanish || isSearchingImages}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
                title="Buscar símbolo"
              >
                {isSearchingImages ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            {/* Resultados de búsqueda de imágenes */}
            {imageResults.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2 border rounded-lg p-2 bg-gray-50 max-h-40 overflow-y-auto">
                {imageResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => setSymbolUrl(result.url)}
                    className={`aspect-square p-1 rounded-md border-2 transition-all overflow-hidden bg-white ${
                      symbolUrl === result.url ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={result.url} alt={result.label} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
              Busca símbolos o deja vacío para usar un avatar de texto.
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium shadow-md shadow-blue-200 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Palabra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}