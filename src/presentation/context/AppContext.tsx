import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import {
  type Sentence,
  type Word,
  createEmptySentence,
  addWordToSentence,
  removeLastWord,
  clearSentence,
} from '../../domain/entities';
import { type UserPreferences, DEFAULT_USER_PREFERENCES } from '../../domain/repositories';

/**
 * App state interface
 */
interface AppState {
  sentence: Sentence;
  currentLocationId: string;
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
}

/**
 * Action types using discriminated unions for type safety
 */
type AppAction =
  | { type: 'ADD_WORD'; payload: Word }
  | { type: 'ADD_MULTIPLE_WORDS'; payload: Word[] }
  | { type: 'REMOVE_LAST_WORD' }
  | { type: 'CLEAR_SENTENCE' }
  | { type: 'SET_LOCATION'; payload: string }
  | { type: 'SET_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

/**
 * Initial state
 */
const initialState: AppState = {
  sentence: createEmptySentence(),
  currentLocationId: 'all',
  preferences: DEFAULT_USER_PREFERENCES,
  isLoading: false,
  error: null,
};

/**
 * Reducer function following immutability principles
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_WORD':
      return {
        ...state,
        sentence: addWordToSentence(state.sentence, action.payload),
      };
    case 'ADD_MULTIPLE_WORDS':
      return {
        ...state,
        sentence: action.payload.reduce(
          (sent, word) => addWordToSentence(sent, word),
          state.sentence
        ),
      };
    case 'REMOVE_LAST_WORD':
      return {
        ...state,
        sentence: removeLastWord(state.sentence),
      };
    case 'CLEAR_SENTENCE':
      return {
        ...state,
        sentence: clearSentence(),
      };
    case 'SET_LOCATION':
      return {
        ...state,
        currentLocationId: action.payload,
      };
    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
}

/**
 * Context type
 */
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Convenience action creators
  addWord: (word: Word) => void;
  addMultipleWords: (words: Word[]) => void;
  removeLastWord: () => void;
  clearSentence: () => void;
  setLocation: (locationId: string) => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * App Provider component
 */
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Convenience action creators
  const addWord = (word: Word) => dispatch({ type: 'ADD_WORD', payload: word });
  const addMultipleWords = (words: Word[]) => dispatch({ type: 'ADD_MULTIPLE_WORDS', payload: words });
  const removeLastWordAction = () => dispatch({ type: 'REMOVE_LAST_WORD' });
  const clearSentenceAction = () => dispatch({ type: 'CLEAR_SENTENCE' });
  const setLocation = (locationId: string) =>
    dispatch({ type: 'SET_LOCATION', payload: locationId });
  const setPreferences = (prefs: Partial<UserPreferences>) =>
    dispatch({ type: 'SET_PREFERENCES', payload: prefs });

  const value: AppContextType = {
    state,
    dispatch,
    addWord,
    addMultipleWords,
    removeLastWord: removeLastWordAction,
    clearSentence: clearSentenceAction,
    setLocation,
    setPreferences,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Custom hook to use app context
 */
export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export type { AppState, AppAction };
