

import { useState, useEffect } from 'react';
import { staticMapUrl } from '../lib/maps';

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
  userLocation?: Location | null;
}

export function MapPane({ poi, className = "", userLocation }: MapPaneProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loadStart, setLoadStart] = useState<number | null>(null);

  // Generate static map URL based on what we have:
  // - If we have both origin and destination: show route between them
  // - If we only have destination: show destination with a single marker
  const mapUrl = poi
    ? userLocation
      ? staticMapUrl({ lat: userLocation.lat, lng: userLocation.lng }, { lat: poi.lat, lng: poi.lng }, 800, 600)
      : staticMapUrl({ lat: poi.lat, lng: poi.lng }, { lat: poi.lat, lng: poi.lng }, 800, 600)
    : null;

  // Reset loading state when map URL changes
  useEffect(() => {
    setImgLoaded(false);
    setLoadError(false);
    setLoadStart(Date.now());
    console.log("[MapPane] Map URL generated:", mapUrl);
    console.log("[MapPane] API Key present:", !!import.meta.env.VITE_GOOGLE_MAPS_KEY);
  }, [mapUrl]);

  const handleImageLoad = () => {
    const loadTime = loadStart ? Date.now() - loadStart : 0;
    console.log(`[MapPane] Map loaded successfully in ${loadTime}ms`);
    setImgLoaded(true);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const loadTime = loadStart ? Date.now() - loadStart : 0;
    console.error(`[MapPane] Map failed to load after ${loadTime}ms`, e);
    console.error("[MapPane] Failed URL:", mapUrl);
    setLoadError(true);
  };

  return (
    <div className={`relative bg-secondary w-full h-full flex flex-col ${className}`}>
      {/* Map container */}
      <div className="flex-1 relative bg-muted overflow-hidden rounded-lg">
        {mapUrl ? (
          <>
            {!imgLoaded && !loadError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                <div className="text-sm text-muted-foreground">Loading map...</div>
              </div>
            )}
            {loadError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted text-destructive p-4">
                <div className="text-lg">⚠️ Map failed to load</div>
                <div className="text-sm text-center">
                  Check your Google Maps API key and ensure Static Maps API is enabled
                </div>
                <button 
                  onClick={() => window.open(mapUrl || '', '_blank')}
                  className="mt-2 px-3 py-1 text-xs border rounded hover:bg-accent"
                >
                  Open URL in new tab
                </button>
              </div>
            )}
            <img
              src={mapUrl}
              alt="Campus map with route"
              className={`w-full h-full object-cover ${imgLoaded ? "block" : "hidden"}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="eager"
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No location selected
          </div>
        )}
      </div>
    </div>
  );
}