/**
 * Location entity - represents a context/place where AAC is used
 * Domain entity with no external dependencies (Clean Architecture)
 */
export interface Location {
  /** Unique identifier for the location */
  readonly id: string;

  /** Spanish name of the location */
  readonly spanish: string;

  /** English translation */
  readonly english: string;

  /** Emoji icon representing the location */
  readonly icon: string;

  /** TailwindCSS color class for visual distinction */
  readonly color: string;

  /** Order for display purposes */
  readonly order: number;
}

/**
 * Factory function to create a Location entity
 */
export function createLocation(props: {
  id: string;
  spanish: string;
  english: string;
  icon: string;
  color: string;
  order?: number;
}): Location {
  return {
    id: props.id,
    spanish: props.spanish,
    english: props.english,
    icon: props.icon,
    color: props.color,
    order: props.order ?? 0,
  };
}

/**
 * Predefined location IDs as constants (avoiding magic strings)
 */
export const LocationIds = {
  ALL: 'all',
  CASA: 'casa',
  ESCUELA: 'escuela',
  PARQUE: 'parque',
  CENTRO_COMERCIAL: 'centro_comercial',
  HOSPITAL: 'hospital',
  RESTAURANTE: 'restaurante',
} as const;

export type LocationId = typeof LocationIds[keyof typeof LocationIds];
