

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Input } from './ui/input';

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

const CAMPUS_CENTER = { lat: 18.0057, lng: -76.7473, name: "Campus Center" };

export function MapPane({ poi, className = "", onLocationChange }: MapPaneProps) {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [locationInput, setLocationInput] = useState("");

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: "My Location"
          };
          setUserLocation(newLocation);
          onLocationChange?.(newLocation);
          setIsLocating(false);
          setShowLocationInput(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setShowLocationInput(true);
          setIsLocating(false);
        }
      );
    } else {
      setShowLocationInput(true);
      setIsLocating(false);
    }
  };

  const handleLocationInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, use campus coordinates with custom name
    const newLocation = {
      ...CAMPUS_CENTER,
      name: locationInput
    };
    setUserLocation(newLocation);
    onLocationChange?.(newLocation);
    setLocationInput("");
  };

  return (
    <div className={`relative bg-secondary w-full h-full flex flex-col ${className}`}>
      <div className="absolute top-2 right-2 z-10 flex flex-wrap gap-2">
        {!showLocationInput ? (
          <button 
            className="px-3 py-2 rounded-lg border hover:bg-accent"
            onClick={handleGetLocation}
            disabled={isLocating}
          >
            {isLocating ? "Getting location..." : "Use my location"}
          </button>
        ) : (
          <form onSubmit={handleLocationInputSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter location name"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-background"
            />
            <button 
              type="submit" 
              className="px-3 py-2 rounded-lg border hover:bg-accent"
              disabled={!locationInput}
            >
              Set start
            </button>
          </form>
        )}
      </div>

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