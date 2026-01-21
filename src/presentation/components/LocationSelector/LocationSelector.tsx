import type { Location } from '../../../domain/entities';

interface LocationSelectorProps {
  locations: Location[];
  currentLocationId: string;
  onLocationChange: (locationId: string) => void;
}

/**
 * Location selector component - horizontal scrollable tabs
 */
export function LocationSelector({
  locations,
  currentLocationId,
  onLocationChange,
}: LocationSelectorProps) {
  return (
    <nav
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      role="tablist"
      aria-label="Seleccionar ubicación"
    >
      {locations.map((location) => {
        const isSelected = location.id === currentLocationId;

        return (
          <button
            key={location.id}
            onClick={() => onLocationChange(location.id)}
            role="tab"
            aria-selected={isSelected}
            aria-controls={`panel-${location.id}`}
            className={`
              flex items-center gap-2 px-4 py-3
              rounded-full font-medium whitespace-nowrap
              transition-all duration-200
              min-w-max
              ${isSelected
                ? `${location.color} text-white shadow-lg scale-105`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            `}
          >
            <span className="text-xl" role="img" aria-hidden="true">
              {location.icon}
            </span>
            <span className="text-sm md:text-base">{location.spanish}</span>
          </button>
        );
      })}
    </nav>
  );
}
