export type QuickPhraseSection = 'personas' | 'acciones' | 'social' | 'sentir' | 'preguntas';

export interface QuickPhraseGroup {
  section: QuickPhraseSection;
  label: string;
  icon: string;
  wordIds: string[];
}

export const QUICK_PHRASE_GROUPS: QuickPhraseGroup[] = [
  {
    section: 'personas',
    label: 'Personas',
    icon: '👤',
    wordIds: ['yo', 'tu', 'el', 'ella', 'nosotros'],
  },
  {
    section: 'acciones',
    label: 'Acciones',
    icon: '🏃',
    wordIds: ['quiero', 'necesito', 'tengo', 'puedo', 'me_gusta'],
  },
  {
    section: 'social',
    label: 'Social',
    icon: '👋',
    wordIds: ['si', 'no', 'hola', 'adios', 'gracias', 'por_favor'],
  },
  {
    section: 'sentir',
    label: 'Sentir',
    icon: '😊',
    wordIds: ['feliz', 'triste', 'hambre', 'sed', 'me_duele'],
  },
  {
    section: 'preguntas',
    label: 'Preguntas',
    icon: '❓',
    wordIds: ['que_pregunta', 'donde_pregunta', 'cuando_pregunta', 'por_que', 'como'],
  },
];
