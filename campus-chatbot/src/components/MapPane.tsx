import { useState, useEffect } from "react";
import { MapPin, Plus, Minus, Navigation } from "lucide-react";
import { Button } from "./ui/button";

interface POI {
  lat: number;
  lng: number;
  name: string;
  description?: string;
}

interface MapPaneProps {
  poi?: POI;
  className?: string;
}

export function MapPane({ poi, className = "" }: MapPaneProps) {
  const [zoom, setZoom] = useState(15);
  const [center, setCenter] = useState({ x: 50, y: 50 }); // Percentage-based center

  // Update center when POI changes
  useEffect(() => {
    if (poi) {
      // Convert lat/lng to normalized coordinates for display
      // This is a simplified projection - in production you'd use proper map projection
      const x = ((poi.lng + 76.75) / 0.01) * 100; // Normalize around UWI campus
      const y = ((18.01 - poi.lat) / 0.01) * 100;
      setCenter({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
      setZoom(16);
    }
  }, [poi]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 1, 10));
  };

  // Calculate marker position based on POI
  const getMarkerPosition = (poiData: POI) => {
    const x = ((poiData.lng + 76.75) / 0.01) * 100;
    const y = ((18.01 - poiData.lat) / 0.01) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  };

  const markerPos = poi ? getMarkerPosition(poi) : null;

  return (
    <div className={`relative bg-secondary ${className}`}>
      {/* Map SVG */}
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Grid pattern background */}
        <defs>
          <pattern
            id="grid"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-border"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />

        {/* Roads/paths */}
        <line
          x1="0"
          y1="50"
          x2="100"
          y2="50"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-muted-foreground/30"
        />
        <line
          x1="50"
          y1="0"
          x2="50"
          y2="100"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-muted-foreground/30"
        />

        {/* Sample buildings (static decorative elements) */}
        <rect
          x="20"
          y="20"
          width="15"
          height="12"
          fill="currentColor"
          className="text-primary/40"
          rx="1"
        />
        <rect
          x="65"
          y="25"
          width="18"
          height="15"
          fill="currentColor"
          className="text-accent/40"
          rx="1"
        />
        <rect
          x="30"
          y="65"
          width="12"
          height="18"
          fill="currentColor"
          className="text-primary/30"
          rx="1"
        />
        <rect
          x="70"
          y="70"
          width="15"
          height="12"
          fill="currentColor"
          className="text-accent/30"
          rx="1"
        />
        <rect
          x="45"
          y="42"
          width="20"
          height="16"
          fill="currentColor"
          className="text-primary/50"
          rx="1"
        />

        {/* POI Marker */}
        {markerPos && (
          <g
            transform={`translate(${markerPos.x}, ${markerPos.y})`}
          >
            {/* Pulsing circle */}
            <circle
              cx="0"
              cy="0"
              r="3"
              fill="currentColor"
              className="text-destructive/20 animate-ping"
            />
            {/* Marker pin */}
            <g transform="translate(0, -4)">
              <path
                d="M 0 0 C -2 0 -3 -1 -3 -3 C -3 -5 0 -8 0 -8 C 0 -8 3 -5 3 -3 C 3 -1 2 0 0 0 Z"
                fill="currentColor"
                className="text-destructive"
                stroke="white"
                strokeWidth="0.3"
              />
              <circle cx="0" cy="-3" r="1" fill="white" />
            </g>
          </g>
        )}

        {/* User location (center) */}
        <g transform={`translate(${center.x}, ${center.y})`}>
          <circle
            cx="0"
            cy="0"
            r="1.5"
            fill="currentColor"
            className="text-primary"
            stroke="white"
            strokeWidth="0.4"
          />
          <circle
            cx="0"
            cy="0"
            r="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.3"
            className="text-primary/30"
          />
        </g>
      </svg>

      {/* Map Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 shadow-md"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 shadow-md"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      {/* Compass */}
      <div className="absolute top-3 left-3">
        <div className="h-10 w-10 rounded-full bg-card shadow-md flex items-center justify-center border border-border">
          <Navigation className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* POI Info Card */}
      {poi && (
        <div className="absolute bottom-3 left-3 right-3 bg-card rounded-lg shadow-lg border border-border p-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm text-foreground truncate">
                {poi.name}
              </h4>
              {poi.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {poi.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attribution */}
      <div className="absolute bottom-1 right-1 text-[10px] text-muted-foreground/50 bg-card/80 px-1.5 py-0.5 rounded">
        UWI Campus Map
      </div>
    </div>
  );
}