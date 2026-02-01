// src/domain/entities/Word.ts

export const WordFrequency = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;
// Definimos el tipo explícitamente para evitar errores de asignación
export type WordFrequency = typeof WordFrequency[keyof typeof WordFrequency];

export type WordCategory = 
  | 'pronouns' | 'verbs' | 'social' | 'questions' 
  | 'emotions' | 'adjectives' | 'numbers' | 'colors' | 'time'
  | 'body' | 'home' | 'school' | 'food' | 'clothing' 
  | 'vehicles' | 'nature' | 'places' | 'animals' 
  | 'nouns';

export const CATEGORY_LABELS: Record<WordCategory, string> = {
  pronouns: 'Personas', verbs: 'Acciones', social: 'Social', questions: 'Preguntas',
  emotions: 'Sentir', adjectives: 'Describir', numbers: 'Números', colors: 'Colores', time: 'Tiempo',
  body: 'Cuerpo', home: 'Casa', school: 'Escuela', food: 'Comida', clothing: 'Ropa',
  vehicles: 'Vehículos', nature: 'Naturaleza', places: 'Lugares', animals: 'Animales',
  nouns: 'Cosas'
};

export const CATEGORY_IMAGES: Record<WordCategory, string> = {
  pronouns: 'https://static.arasaac.org/pictograms/39622/39622_300.png',
  verbs: 'https://static.arasaac.org/pictograms/6465/6465_300.png',
  social: 'https://static.arasaac.org/pictograms/6610/6610_300.png',
  questions: 'https://static.arasaac.org/pictograms/7217/7217_300.png',
  emotions: 'https://static.arasaac.org/pictograms/11476/11476_300.png',
  adjectives: 'https://static.arasaac.org/pictograms/4658/4658_300.png',
  numbers: 'https://static.arasaac.org/pictograms/2879/2879_300.png',
  colors: 'https://static.arasaac.org/pictograms/5968/5968_300.png',
  time: 'https://static.arasaac.org/pictograms/2549/2549_300.png',
  body: 'https://static.arasaac.org/pictograms/6473/6473_300.png',
  home: 'https://static.arasaac.org/pictograms/6964/6964_300.png',
  school: 'https://static.arasaac.org/pictograms/32446/32446_300.png',
  food: 'https://static.arasaac.org/pictograms/4610/4610_300.png',
  clothing: 'https://static.arasaac.org/pictograms/7233/7233_300.png',
  vehicles: 'https://static.arasaac.org/pictograms/2339/2339_300.png',
  nature: 'https://static.arasaac.org/pictograms/20389/20389_300.png',
  places: 'https://static.arasaac.org/pictograms/9819/9819_300.png',
  animals: 'https://static.arasaac.org/pictograms/6901/6901_300.png',
  nouns: 'https://static.arasaac.org/pictograms/11318/11318_300.png'
};

export const CATEGORY_ORDER: WordCategory[] = [
  'pronouns', 'verbs', 'social', 'questions', 
  'emotions', 'adjectives', 'food', 'home', 
  'school', 'body', 'places', 'clothing', 
  'vehicles', 'nature', 'time', 'colors', 'numbers', 
  'animals', 'nouns'
];

export const CATEGORY_COLORS: Record<WordCategory, string> = {
  pronouns: 'bg-blue-100', verbs: 'bg-green-100', social: 'bg-yellow-100',
  questions: 'bg-purple-100', nouns: 'bg-orange-100', emotions: 'bg-pink-100',
  adjectives: 'bg-teal-100', numbers: 'bg-indigo-100', animals: 'bg-emerald-100', 
  food: 'bg-red-100', clothing: 'bg-cyan-100', time: 'bg-gray-100', colors: 'bg-rose-100',
  body: 'bg-stone-100', home: 'bg-amber-100', vehicles: 'bg-slate-100',
  school: 'bg-violet-100', places: 'bg-sky-100', nature: 'bg-lime-100'
};

export const CATEGORY_EMOJIS: Record<WordCategory, string> = {
   pronouns: '👤', verbs: '🏃', social: '👋', questions: '❓',
   nouns: '📦', emotions: '😊', adjectives: '✨', numbers: '🔢',
   colors: '🎨', time: '⏰', body: '🦵', home: '🏠', school: '🎒',
   food: '🍎', clothing: '👕', vehicles: '🚗', nature: '🌳', places: '🏙️',
   animals: '🐶'
};

export interface Word {
  id: string; spanish: string; english: string; category: WordCategory;
  symbolUrl?: string; locationId?: string; frequency: WordFrequency;
}

export const createWord = (word: Omit<Word, 'id'>): Word => ({ ...word, id: crypto.randomUUID() });
export const wordBelongsToLocation = (word: Word, locationId: string | null) => !locationId || word.locationId === locationId;
export const wordMatchesCategory = (word: Word, category: WordCategory) => word.category === category;
export const validateCategory = (category: string): category is WordCategory => category in CATEGORY_LABELS;
export const validateFrequency = (freq: number) => freq >= 0;