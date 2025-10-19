

import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

interface POI {
  lat: number;
  lng: number;
  name: string;
  description?: string;
}

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface MapPaneProps {
  poi?: POI;
  className?: string;
  onLocationChange?: (location: Location | null) => void;
}

export function MapPane({ poi, className = "", onLocationChange }: MapPaneProps) {
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  // Update userLocation when parent sends location updates
  React.useEffect(() => {
    // This effect will be triggered when the parent updates the location
    // We can listen for location changes from the parent component
  }, [onLocationChange]);

  return (
    <div className={`relative bg-secondary w-full h-full flex flex-col ${className}`}>

      {/* Map container */}
      <div className="flex-1 relative">
        {/* Map content will be rendered here */}
        {userLocation && (
          <div
            className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${((userLocation.lng + 76.75) / 0.01) * 100}%`,
              top: `${((18.01 - userLocation.lat) / 0.01) * 100}%`,
            }}
          >
            <MapPin className="w-full h-full text-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
}