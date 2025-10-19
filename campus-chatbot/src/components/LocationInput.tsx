// src/components/LocationInput.tsx
import { useRef, useEffect, useState } from "react";
import { MapPin, Loader2, Navigation } from "lucide-react";

type LocationInputProps = {
  value: string;
  onLocationSelect: (location: { name: string; lat: number; lng: number }) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function LocationInput({
  value,
  onLocationSelect,
  placeholder = "Search for a location...",
  disabled = false,
}: LocationInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!inputRef.current) return;

    // Check if Google Maps API is loaded
    if (!window.google?.maps?.places) {
      console.warn("[LocationInput] Google Maps Places library not loaded yet");
      return;
    }

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["establishment", "geocode"],
      fields: ["name", "formatted_address", "geometry"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      
      if (!place.geometry?.location) {
        console.warn("[LocationInput] No location data for selected place");
        return;
      }

      const location = {
        name: place.name || place.formatted_address || "Selected Location",
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      console.log("[LocationInput] Place selected:", location);
      onLocationSelect(location);
    });

    return () => {
      // Cleanup autocomplete listeners
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [onLocationSelect]);

  // Get user's current location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          name: "My Current Location",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        console.log("[LocationInput] Current location:", location);
        onLocationSelect(location);
        setIsLoadingLocation(false);

        // Update input field
        if (inputRef.current) {
          inputRef.current.value = "My Current Location";
        }
      },
      (error) => {
        console.error("[LocationInput] Geolocation error:", error);
        
        let errorMessage = "Unable to get your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable in browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {/* Location Search Input */}
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            defaultValue={value}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Use My Location Button */}
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={disabled || isLoadingLocation}
          className="px-3 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
          title="Use my current location"
        >
          {isLoadingLocation ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Getting location...</span>
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4" />
              <span className="hidden sm:inline">Use My Location</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {locationError && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <span>⚠️</span>
          {locationError}
        </p>
      )}
    </div>
  );
}
