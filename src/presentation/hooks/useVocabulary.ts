import { useState, useEffect, useMemo } from 'react';
import { type Word, WordFrequency, wordBelongsToLocation, validateCategory, validateFrequency } from '../../domain/entities';
// import { SupabaseVocabularyRepository } from '../../infrastructure/supabase'; // Comentamos esto por ahora
import vocabularyData from '../../data/vocabulary.json';

/**
 * Raw vocabulary item from JSON (before transformation)
 */
interface RawVocabularyItem {
  id: string;
  spanish: string;
  english: string;
  category: string;
  locations: string[];
  frequency: string;
  symbolUrl?: string;
  audioUrl?: string;
}

// === MAPEO MANUAL DE TUS 159 IDs EXACTOS ===
const ID_CATEGORY_MAP: Record<string, string> = {
  // PRONOMBRES (Incluye familia y profesiones como 'Personas')
  'yo': 'pronouns', 'tu': 'pronouns', 'el': 'pronouns', 'ella': 'pronouns',
  'nosotros': 'pronouns', 'ellos': 'pronouns', 'esto': 'pronouns', 'eso': 'pronouns',
  'todo': 'pronouns', 'nada': 'pronouns', 'mi': 'pronouns', 'quien': 'pronouns',
  'que': 'pronouns', 'donde': 'pronouns', 'cuando': 'pronouns', 'porque': 'pronouns',
  'algo': 'pronouns', 'alguien': 'pronouns', 'nadie': 'pronouns',
  'mama': 'pronouns', 'papa': 'pronouns', 'hermano': 'pronouns', 'hermana': 'pronouns',
  'amigo': 'pronouns', 'maestro': 'pronouns', 'doctor': 'pronouns',

  // VERBOS
  'quiero': 'verbs', 'necesito': 'verbs', 'tengo': 'verbs', 'me_gusta': 'verbs',
  'no_me_gusta': 'verbs', 'puedo': 'verbs', 'ir': 'verbs', 'comer': 'verbs',
  'beber': 'verbs', 'jugar': 'verbs', 'dormir': 'verbs', 'ayudar': 'verbs',
  'hablar': 'verbs', 'escuchar': 'verbs', 'ver': 'verbs', 'leer': 'verbs',
  'escribir': 'verbs', 'caminar': 'verbs', 'correr': 'verbs', 'sentarse': 'verbs',
  'levantarse': 'verbs', 'esperar': 'verbs', 'terminar': 'verbs', 'empezar': 'verbs',
  'abrir': 'verbs', 'cerrar': 'verbs', 'comprar': 'verbs', 'pagar': 'verbs',
  // VERBOS CONJUGADOS
  'quieres': 'verbs', 'quiere': 'verbs', 'queremos': 'verbs', 'quieren': 'verbs',
  'necesitas': 'verbs', 'necesita': 'verbs', 'necesitamos': 'verbs', 'necesitan': 'verbs',
  'tienes': 'verbs', 'tiene': 'verbs', 'tenemos': 'verbs', 'tienen': 'verbs',
  'puedes': 'verbs', 'puede': 'verbs', 'podemos': 'verbs', 'pueden': 'verbs',
  'te_gusta': 'verbs', 'le_gusta': 'verbs', 'nos_gusta': 'verbs', 'les_gusta': 'verbs',

  // SOCIAL
  'si': 'social', 'no': 'social', 'hola': 'social', 'adios': 'social',
  'gracias': 'social', 'por_favor': 'social', 'lo_siento': 'social', 'perdon': 'social',
  'buenos_dias': 'social', 'buenas_noches': 'social',

  // PREGUNTAS
  'que_pregunta': 'questions', 'donde_pregunta': 'questions', 'cuando_pregunta': 'questions',
  'quien_pregunta': 'questions', 'por_que': 'questions', 'como': 'questions', 'cuanto': 'questions',

  // COMIDA
  'agua': 'food', 'comida': 'food', 'almuerzo': 'food', 'desayuno': 'food', 'cena': 'food',
  'menu': 'food',

  // CASA (Objetos y Muebles)
  'bano': 'home', 'cama': 'home', 'cocina_lugar': 'home', 'sala': 'home',
  'cuarto': 'home', 'mesa': 'home', 'silla': 'home', 'television': 'home',
  'musica': 'home', 'telefono': 'home', 
  'juguete': 'home', 'pelota': 'home',

  // ESCUELA
  'libro': 'school', 'lapiz': 'school', 'papel': 'school', 'mochila': 'school',
  'clase': 'school', 'recreo': 'school', 'tarea': 'school',

  // LUGARES (Ocio y Comercio)
  'columpio': 'places', 'resbaladilla': 'places', 'caja': 'places', 'dinero': 'places',

  // CUERPO (y Salud)
  'cabeza': 'body', 'estomago': 'body', 'mano': 'body', 'pie': 'body', 'medicina': 'body',

  // SENTIR (Emociones y Sensaciones)
  'feliz': 'emotions', 'triste': 'emotions', 'enojado': 'emotions', 'cansado': 'emotions',
  'hambre': 'emotions', 'sed': 'emotions', 'frio_emocion': 'emotions', 'calor': 'emotions',
  'asustado': 'emotions', 'sorprendido': 'emotions', 'me_duele': 'emotions', 'dolor': 'emotions',

  // ROPA
  'ropa': 'clothing', 'zapatos': 'clothing',

  // VEHICULOS
  'carro': 'vehicles',

  // NATURALEZA
  'arbol': 'nature', 'flor': 'nature',

  // DESCRIBIR (Adjetivos)
  'grande': 'adjectives', 'pequeno': 'adjectives', 'mas': 'adjectives', 'menos': 'adjectives',
  'bueno': 'adjectives', 'malo': 'adjectives', 'nuevo': 'adjectives', 'viejo': 'adjectives',
  'rapido': 'adjectives', 'lento': 'adjectives', 'aqui': 'adjectives', 'alla': 'adjectives',
  'arriba': 'adjectives', 'abajo': 'adjectives', 'dentro': 'adjectives', 'fuera': 'adjectives',
  'otra_vez': 'adjectives', 'diferente': 'adjectives', 'mismo': 'adjectives',

  // NUMEROS
  'uno': 'numbers', 'dos': 'numbers', 'tres': 'numbers', 'cuatro': 'numbers', 'cinco': 'numbers', 'diez': 'numbers',

  // COLORES
  'rojo': 'colors', 'azul': 'colors', 'verde': 'colors', 'amarillo': 'colors', 'negro': 'colors', 'blanco': 'colors',

  // TIEMPO
  'hoy': 'time', 'manana': 'time', 'ayer': 'time', 'ahora': 'time', 'despues': 'time', 'antes': 'time'
};

function transformToWord(raw: RawVocabularyItem): Word {
  return {
    id: raw.id,
    spanish: raw.spanish,
    english: raw.english,
    category: validateCategory(raw.category),
    locations: raw.locations,
    frequency: validateFrequency(raw.frequency),
    symbolUrl: raw.symbolUrl ?? '',
    audioUrl: raw.audioUrl,
  };
}

// Singleton repository instance (Comentado temporalmente)
// const vocabularyRepository = new SupabaseVocabularyRepository();

/**
 * Custom hook for vocabulary management
 * FORZADO A MODO LOCAL PARA VER PICTOGRAMAS ARASAAC
 */
export function useVocabulary(currentLocationId: string = 'all') {
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'supabase' | 'local' | null>(null);

  // Load vocabulary on mount
  useEffect(() => {
    async function loadVocabulary() {
      setIsLoading(true);
      setError(null);

      try {
        // === MODO DESARROLLO: FORZAR DATOS LOCALES ===
        // Estamos ignorando Supabase a propósito para ver los cambios del JSON
        console.log('🔌 Forzando modo LOCAL para cargar pictogramas ARASAAC...');
        
        // Simular un pequeño delay para que se sienta real (opcional)
        await new Promise(resolve => setTimeout(resolve, 100));

        const words = (vocabularyData as RawVocabularyItem[]).map(transformToWord);
        setAllWords(words);
        setDataSource('local');
        console.log(`✅ Cargadas ${words.length} palabras desde vocabulary.json`);

        /* // --- CÓDIGO ORIGINAL DE SUPABASE (GUARDADO PARA DESPUÉS) ---
        const words = await vocabularyRepository.getAllWords();
        if (words.length > 0) {
          setAllWords(words);
          setDataSource('supabase');
        } else {
          throw new Error('No words in Supabase, using local fallback');
        }
        */

      } catch (err) {
        console.warn('⚠️ Error loading vocabulary:', err);
        // Fallback de seguridad (aunque arriba ya forzamos local)
        const words = (vocabularyData as RawVocabularyItem[]).map(transformToWord);
        setAllWords(words);
        setDataSource('local');
      } finally {
        setIsLoading(false);
      }
    }

    loadVocabulary();
  }, []);

  // Filter words by current location
  const filteredWords = useMemo(() => {
    if (currentLocationId === 'all') {
      return allWords;
    }
    return allWords.filter((word) => wordBelongsToLocation(word, currentLocationId));
  }, [allWords, currentLocationId]);

  // Group words by category
  const wordsByCategory = useMemo(() => {
    const grouped: Record<string, Word[]> = {};

    for (const word of filteredWords) {
      if (!grouped[word.category]) {
        grouped[word.category] = [];
      }
      grouped[word.category].push(word);
    }

    return grouped;
  }, [filteredWords]);

  // Get high-frequency words (core vocabulary)
  const coreWords = useMemo(() => {
    return filteredWords.filter((word) => word.frequency === WordFrequency.HIGH);
  }, [filteredWords]);

  // Search functionality
  const searchWords = (query: string): Word[] => {
    if (!query.trim()) return filteredWords;

    const lowerQuery = query.toLowerCase();
    return filteredWords.filter(
      (word) =>
        word.spanish.toLowerCase().includes(lowerQuery) ||
        word.english.toLowerCase().includes(lowerQuery)
    );
  };

  // Get word by ID
  const getWordById = (id: string): Word | undefined => {
    return allWords.find((word) => word.id === id);
  };

  return {
    allWords,
    filteredWords,
    wordsByCategory,
    coreWords,
    isLoading,
    error,
    dataSource,
    searchWords,
    getWordById,
    totalCount: allWords.length,
    filteredCount: filteredWords.length,
  };
}