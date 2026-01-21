import { useState, useEffect, useMemo } from 'react';
import { type Location, createLocation } from '../../domain/entities';
import locationsData from '../../data/locations.json';

/**
 * Raw location item from JSON
 */
interface RawLocationItem {
  id: string;
  spanish: string;
  english: string;
  icon: string;
  color: string;
  order: number;
}

/**
 * The "All" location for showing all vocabulary
 */
const ALL_LOCATION: Location = {
  id: 'all',
  spanish: 'Todo',
  english: 'All',
  icon: '🌐',
  color: 'bg-gray-500',
  order: 0,
};

/**
 * Transform raw JSON data to Location entity
 */
function transformToLocation(raw: RawLocationItem): Location {
  return createLocation({
    id: raw.id,
    spanish: raw.spanish,
    english: raw.english,
    icon: raw.icon,
    color: raw.color,
    order: raw.order,
  });
}

/**
 * Custom hook for location management
 */
export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([ALL_LOCATION]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load locations on mount
  useEffect(() => {
    try {
      const loadedLocations = (locationsData as RawLocationItem[])
        .map(transformToLocation)
        .sort((a, b) => a.order - b.order);

      setLocations([ALL_LOCATION, ...loadedLocations]);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load locations');
      setIsLoading(false);
    }
  }, []);

  // Get location by ID
  const getLocationById = (id: string): Location | undefined => {
    return locations.find((loc) => loc.id === id);
  };

  // Get locations without "All"
  const specificLocations = useMemo(() => {
    return locations.filter((loc) => loc.id !== 'all');
  }, [locations]);

  return {
    locations,
    specificLocations,
    isLoading,
    error,
    getLocationById,
  };
}
