// src/components/DirectionsCard.tsx
import { useState } from "react";
import type { LatLng } from "../lib/maps";
import { gmapsDeepLink, gmapsDeepLinkByName, gmapsDirectionsEmbedUrl } from "../lib/maps";
import LocationInput from "./LocationInput";

type Props = {
  origin: { name: string; coords?: LatLng } | null;  // coords optional if geolocation denied
  dest:   { name: string; coords: LatLng };
  mode?: "walking" | "driving" | "transit";
  notes?: string[];
  onOriginChange?: (location: { name: string; lat: number; lng: number }) => void;
};

console.log("Maps key:", import.meta.env.VITE_GOOGLE_MAPS_KEY);

export default function DirectionsCard({ origin, dest, mode = "walking", notes = [], onOriginChange }: Props) {
  const [showLocationInput, setShowLocationInput] = useState(false);

  const haveOriginCoords = Boolean(origin?.coords);
  const deepLink = haveOriginCoords
    ? gmapsDeepLink(origin!.coords!, dest.coords, mode)
    : gmapsDeepLinkByName("Your location", dest.name, mode);

  // Log API key and URLs for debugging
  console.log("[DirectionsCard] VITE_GOOGLE_MAPS_KEY:", import.meta.env.VITE_GOOGLE_MAPS_KEY);
  console.log("[DirectionsCard] deepLink:", deepLink);

  const handleLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    onOriginChange?.(location);
    setShowLocationInput(false);
  };

  return (
    <div className="rounded-2xl border p-3 grid gap-3">
      {/* Location Input Section */}
      {showLocationInput ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Set Your Location</span>
            <button
              onClick={() => setShowLocationInput(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
          <LocationInput
            value={origin?.name ?? ""}
            onLocationSelect={handleLocationSelect}
            placeholder="Search for your starting location..."
          />
        </div>
      ) : (
        <div className="text-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">From:</span> {origin?.name ?? "Your location"}
            </div>
            {onOriginChange && (
              <button
                onClick={() => setShowLocationInput(true)}
                className="text-xs text-primary hover:underline"
              >
                Change
              </button>
            )}
          </div>
          <div><span className="font-medium">To:</span> {dest.name}</div>
          <div className="text-xs opacity-70 capitalize">Mode: {mode}</div>
        </div>
      )}

      {/* Interactive Directions Map */}
      <div className="relative overflow-hidden rounded-xl" style={{ height: 320 }}>
        <iframe
          title="Route directions"
          src={gmapsDirectionsEmbedUrl(origin?.coords ?? null, dest.coords, mode)}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {notes.length > 0 && (
        <ul className="text-sm list-disc ml-5">
          {notes.map((n, i) => <li key={i}>{n}</li>)}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <a href={deepLink} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg border hover:bg-accent">
          Open in Google Maps
        </a>
        <button
          className="px-3 py-2 rounded-lg border hover:bg-accent"
          onClick={() => navigator.clipboard.writeText(dest.name)}
        >
          Copy Destination
        </button>
                <button
                  className="px-3 py-2 rounded-lg border hover:bg-accent"
                  onClick={() => {
                    const utter = new SpeechSynthesisUtterance(`Directions to ${dest.name}. ${notes.join(". ")}`);
                    speechSynthesis.speak(utter);
                  }}
                >
                  Speak Directions
                </button>
              </div>
            </div>
          );
        }