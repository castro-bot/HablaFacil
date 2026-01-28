import { useState, useEffect, useMemo } from 'react';
import { type Word, wordBelongsToLocation, validateCategory } from '../../domain/entities';
import vocabularyData from '../../data/vocabulary.json';

const WordFrequency = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;

interface RawVocabularyItem {
  id: string; spanish: string; english: string; category: string;
  locations: string[]; frequency: string; symbolUrl?: string; audioUrl?: string;
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
  // CORRECCIÓN DEL ERROR DE TIPOS (Type '3' is not assignable to type '1')
  // Inicializamos explícitamente con el tipo 'number' o un valor válido
  let freqNumber: number = WordFrequency.LOW;

  if (raw.frequency) {
    const f = raw.frequency.toLowerCase();
    if (f === 'high') freqNumber = WordFrequency.HIGH;
    else if (f === 'medium') freqNumber = WordFrequency.MEDIUM;
  }

  // Usamos el ID para buscar la categoría exacta en el mapa
  const forcedCategory = ID_CATEGORY_MAP[raw.id];
  
  // Si encontramos la categoría en el mapa, la usamos. Si no, fallback a 'nouns'.
  const finalCategory = forcedCategory && validateCategory(forcedCategory) 
    ? forcedCategory 
    : 'nouns';

  return {
    id: raw.id,
    spanish: raw.spanish,
    english: raw.english,
    category: finalCategory,
    locations: raw.locations,
    frequency: freqNumber,
    symbolUrl: raw.symbolUrl ?? '',
    audioUrl: raw.audioUrl,
  } as unknown as Word;
}

export function useVocabulary(currentLocationId: string = 'all') {
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'supabase' | 'local' | null>(null);

  useEffect(() => {
    async function loadVocabulary() {
      setIsLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 50));
        const words = (vocabularyData as RawVocabularyItem[]).map(transformToWord);
        setAllWords(words);
        setDataSource('local');
      } catch (err) {
        console.warn('⚠️ Error loading vocabulary:', err);
        const words = (vocabularyData as RawVocabularyItem[]).map(transformToWord);
        setAllWords(words);
        setDataSource('local');
      } finally {
        setIsLoading(false);
      }
    }
    loadVocabulary();
  }, []);

  const filteredWords = useMemo(() => {
    if (currentLocationId === 'all') return allWords;
    return allWords.filter((word) => wordBelongsToLocation(word, currentLocationId));
  }, [allWords, currentLocationId]);

  const wordsByCategory = useMemo(() => {
    const grouped: Record<string, Word[]> = {};
    for (const word of filteredWords) {
      if (!grouped[word.category]) grouped[word.category] = [];
      grouped[word.category].push(word);
    }
    return grouped;
  }, [filteredWords]);

  const coreWords = useMemo(() => {
    return filteredWords.filter((word) => word.frequency === WordFrequency.HIGH);
  }, [filteredWords]);

  const searchWords = (query: string): Word[] => {
    if (!query.trim()) return filteredWords;
    const lowerQuery = query.toLowerCase();
    return filteredWords.filter(
      (word) =>
        word.spanish.toLowerCase().includes(lowerQuery) ||
        word.english.toLowerCase().includes(lowerQuery)
    );
  };

  const addNewWord = async (word: Omit<Word, 'id'>): Promise<void> => {
    const id = `local_${Date.now()}`;
    const newWord = { ...word, id } as Word;
    setAllWords(prev => [newWord, ...prev]);
  };

  return {
    allWords, filteredWords, wordsByCategory, coreWords, isLoading,
    error, dataSource, searchWords, addNewWord,
    totalCount: allWords.length, filteredCount: filteredWords.length,
    reload: () => {} 
  };
}