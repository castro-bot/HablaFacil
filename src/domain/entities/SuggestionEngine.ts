import type { Word, WordCategory } from './Word';

export interface SuggestionRule {
  trigger: { wordId?: string; category?: WordCategory };
  suggestedWordIds: string[];
}

export const SUGGESTION_RULES: SuggestionRule[] = [
  // Despues de pronombres, sugerir verbos CONJUGADOS correctamente
  { trigger: { wordId: 'yo' }, suggestedWordIds: ['quiero', 'necesito', 'tengo', 'puedo', 'me_gusta'] },
  { trigger: { wordId: 'tu' }, suggestedWordIds: ['quieres', 'necesitas', 'tienes', 'puedes', 'te_gusta'] },
  { trigger: { wordId: 'el' }, suggestedWordIds: ['quiere', 'necesita', 'tiene', 'puede', 'le_gusta'] },
  { trigger: { wordId: 'ella' }, suggestedWordIds: ['quiere', 'necesita', 'tiene', 'puede', 'le_gusta'] },
  { trigger: { wordId: 'nosotros' }, suggestedWordIds: ['queremos', 'necesitamos', 'tenemos', 'podemos', 'nos_gusta'] },
  { trigger: { wordId: 'ellos' }, suggestedWordIds: ['quieren', 'necesitan', 'tienen', 'pueden', 'les_gusta'] },

  // Despues de verbos conjugados (todas las formas), sugerir objetos/acciones
  { trigger: { wordId: 'quiero' }, suggestedWordIds: ['comer', 'beber', 'jugar', 'dormir', 'ir', 'agua', 'comida'] },
  { trigger: { wordId: 'quieres' }, suggestedWordIds: ['comer', 'beber', 'jugar', 'dormir', 'ir', 'agua', 'comida'] },
  { trigger: { wordId: 'quiere' }, suggestedWordIds: ['comer', 'beber', 'jugar', 'dormir', 'ir', 'agua', 'comida'] },
  { trigger: { wordId: 'queremos' }, suggestedWordIds: ['comer', 'beber', 'jugar', 'dormir', 'ir', 'agua', 'comida'] },
  { trigger: { wordId: 'quieren' }, suggestedWordIds: ['comer', 'beber', 'jugar', 'dormir', 'ir', 'agua', 'comida'] },

  { trigger: { wordId: 'necesito' }, suggestedWordIds: ['ayudar', 'bano', 'agua', 'comida', 'medicina', 'ir'] },
  { trigger: { wordId: 'necesitas' }, suggestedWordIds: ['ayudar', 'bano', 'agua', 'comida', 'medicina', 'ir'] },
  { trigger: { wordId: 'necesita' }, suggestedWordIds: ['ayudar', 'bano', 'agua', 'comida', 'medicina', 'ir'] },
  { trigger: { wordId: 'necesitamos' }, suggestedWordIds: ['ayudar', 'bano', 'agua', 'comida', 'medicina', 'ir'] },
  { trigger: { wordId: 'necesitan' }, suggestedWordIds: ['ayudar', 'bano', 'agua', 'comida', 'medicina', 'ir'] },

  { trigger: { wordId: 'tengo' }, suggestedWordIds: ['hambre', 'sed', 'frio_emocion', 'calor', 'me_duele'] },
  { trigger: { wordId: 'tienes' }, suggestedWordIds: ['hambre', 'sed', 'frio_emocion', 'calor'] },
  { trigger: { wordId: 'tiene' }, suggestedWordIds: ['hambre', 'sed', 'frio_emocion', 'calor'] },
  { trigger: { wordId: 'tenemos' }, suggestedWordIds: ['hambre', 'sed', 'frio_emocion', 'calor'] },
  { trigger: { wordId: 'tienen' }, suggestedWordIds: ['hambre', 'sed', 'frio_emocion', 'calor'] },

  { trigger: { wordId: 'puedo' }, suggestedWordIds: ['ir', 'jugar', 'comer', 'beber', 'hablar', 'ver'] },
  { trigger: { wordId: 'puedes' }, suggestedWordIds: ['ir', 'jugar', 'comer', 'beber', 'hablar', 'ver'] },
  { trigger: { wordId: 'puede' }, suggestedWordIds: ['ir', 'jugar', 'comer', 'beber', 'hablar', 'ver'] },
  { trigger: { wordId: 'podemos' }, suggestedWordIds: ['ir', 'jugar', 'comer', 'beber', 'hablar', 'ver'] },
  { trigger: { wordId: 'pueden' }, suggestedWordIds: ['ir', 'jugar', 'comer', 'beber', 'hablar', 'ver'] },

  { trigger: { wordId: 'me_gusta' }, suggestedWordIds: ['comer', 'jugar', 'musica', 'comida', 'pelota'] },
  { trigger: { wordId: 'te_gusta' }, suggestedWordIds: ['comer', 'jugar', 'musica', 'comida', 'pelota'] },
  { trigger: { wordId: 'le_gusta' }, suggestedWordIds: ['comer', 'jugar', 'musica', 'comida', 'pelota'] },
  { trigger: { wordId: 'nos_gusta' }, suggestedWordIds: ['comer', 'jugar', 'musica', 'comida', 'pelota'] },
  { trigger: { wordId: 'les_gusta' }, suggestedWordIds: ['comer', 'jugar', 'musica', 'comida', 'pelota'] },

  // Despues de palabras de pregunta
  { trigger: { wordId: 'donde_pregunta' }, suggestedWordIds: ['mama', 'papa', 'bano', 'comida', 'juguete'] },
  { trigger: { wordId: 'que_pregunta' }, suggestedWordIds: ['quiero', 'comer', 'comida', 'jugar'] },
  { trigger: { wordId: 'cuando_pregunta' }, suggestedWordIds: ['comer', 'jugar', 'ir', 'dormir'] },
  { trigger: { wordId: 'por_que' }, suggestedWordIds: ['no', 'si', 'triste', 'enojado'] },

  // Fallback por categoria: despues de verbo, sugerir sustantivos comunes
  { trigger: { category: 'verbs' }, suggestedWordIds: ['agua', 'comida', 'bano', 'mama', 'papa', 'amigo'] },
  // Despues de emociones, sugerir ayuda
  { trigger: { category: 'emotions' }, suggestedWordIds: ['ayudar', 'mama', 'papa', 'por_favor'] },
];

export interface PhraseTemplate {
  id: string;
  label: string;
  prefixWordIds: string[];
  slotHint: string;
  suggestedFillIds: string[];
}

export const PHRASE_TEMPLATES: PhraseTemplate[] = [
  {
    id: 'yo_quiero',
    label: 'Yo quiero ___',
    prefixWordIds: ['yo', 'quiero'],
    slotHint: 'comida, jugar, ir...',
    suggestedFillIds: ['comer', 'beber', 'jugar', 'dormir', 'ir', 'agua', 'comida'],
  },
  {
    id: 'necesito',
    label: 'Necesito ___',
    prefixWordIds: ['necesito'],
    slotHint: 'ayuda, bano, agua...',
    suggestedFillIds: ['ayudar', 'bano', 'agua', 'comida', 'medicina'],
  },
  {
    id: 'donde_esta',
    label: 'Donde esta ___?',
    prefixWordIds: ['donde_pregunta'],
    slotHint: 'mama, bano, comida...',
    suggestedFillIds: ['mama', 'papa', 'bano', 'comida', 'juguete', 'amigo'],
  },
  {
    id: 'me_duele',
    label: 'Me duele ___',
    prefixWordIds: ['me_duele'],
    slotHint: 'cabeza, estomago...',
    suggestedFillIds: ['cabeza', 'estomago', 'mano', 'pie'],
  },
  {
    id: 'puedo_ir',
    label: 'Puedo ir ___?',
    prefixWordIds: ['puedo', 'ir'],
    slotHint: 'bano, recreo...',
    suggestedFillIds: ['bano', 'recreo', 'cocina_lugar', 'sala'],
  },
  {
    id: 'quiero_ir',
    label: 'Quiero ir ___',
    prefixWordIds: ['quiero', 'ir'],
    slotHint: 'casa, escuela...',
    suggestedFillIds: ['bano', 'recreo', 'cocina_lugar', 'sala'],
  },
];

export function getSuggestionsForSentence(
  sentenceWords: ReadonlyArray<Word>,
  allWords: Word[]
): Word[] {
  if (sentenceWords.length === 0) return [];

  const lastWord = sentenceWords[sentenceWords.length - 1];
  const wordMap = new Map(allWords.map(w => [w.id, w]));

  // Intentar match por ID de palabra primero
  const specificRule = SUGGESTION_RULES.find(r => r.trigger.wordId === lastWord.id);
  if (specificRule) {
    return specificRule.suggestedWordIds
      .map(id => wordMap.get(id))
      .filter((w): w is Word => w !== undefined);
  }

  // Fallback: match por categoria
  const categoryRule = SUGGESTION_RULES.find(r => r.trigger.category === lastWord.category);
  if (categoryRule) {
    return categoryRule.suggestedWordIds
      .map(id => wordMap.get(id))
      .filter((w): w is Word => w !== undefined);
  }

  return [];
}
