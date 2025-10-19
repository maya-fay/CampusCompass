// src/components/DirectionsCard.tsx
import { useState } from "react";
import type { LatLng } from "../lib/maps";
import { staticMapUrl, gmapsDeepLink, gmapsDeepLinkByName, gmapsEmbedUrlForDest } from "../lib/maps";
import { Input } from "./ui/input";

type Props = {
  origin: { name: string; coords?: LatLng } | null;  // coords optional if geolocation denied
  dest:   { name: string; coords: LatLng };
  mode?: "walking" | "driving" | "transit";
  notes?: string[];
  onLocationChange?: (location: { name: string; coords: LatLng } | null) => void;
};

console.log("Maps key:", import.meta.env.VITE_GOOGLE_MAPS_KEY);

export default function DirectionsCard({ origin, dest, mode = "walking", notes = [], onLocationChange }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [locationInput, setLocationInput] = useState("");

  const handleLocationInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLocation = {
      name: locationInput,
      coords: { lat: 18.0057, lng: -76.7473 } // Default campus center coords
    };
    onLocationChange?.(newLocation);
    setLocationInput("");
  };

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            name: "My Location",
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          };
          onLocationChange?.(newLocation);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please make sure location services are enabled.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const haveOriginCoords = Boolean(origin?.coords);
  const staticUrl = haveOriginCoords ? staticMapUrl(origin!.coords!, dest.coords) : null;
  const deepLink = haveOriginCoords
    ? gmapsDeepLink(origin!.coords!, dest.coords, mode)
    : gmapsDeepLinkByName("Your location", dest.name, mode);

  // Log API key and URLs for debugging
  console.log("[DirectionsCard] VITE_GOOGLE_MAPS_KEY:", import.meta.env.VITE_GOOGLE_MAPS_KEY);
  console.log("[DirectionsCard] staticUrl:", staticUrl);
  console.log("[DirectionsCard] deepLink:", deepLink);

  return (
    <div className="rounded-2xl border p-3 grid gap-3">
      <div className="text-sm">
        <div><span className="font-medium">From:</span> {origin?.name ?? "Your location"}</div>
        <div><span className="font-medium">To:</span> {dest.name}</div>
        <div className="text-xs opacity-70 capitalize">Mode: {mode}</div>
      </div>

      {/* Preview: prefer Static Maps; if no key/coords, embed simple destination map */}
      {staticUrl ? (
        <div className="relative overflow-hidden rounded-xl bg-muted">
          {!imgLoaded && <div className="animate-pulse h-40" />}
          <img
            src={staticUrl}
            alt="Route preview map"
            className={`w-full ${imgLoaded ? "block" : "hidden"}`}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl" style={{ height: 240 }}>
          <iframe
            title="Destination map"
            src={gmapsEmbedUrlForDest(dest.coords)}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      {notes.length > 0 && (
        <ul className="text-sm list-disc ml-5">
          {notes.map((n, i) => <li key={i}>{n}</li>)}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <div className="flex flex-wrap gap-2 w-full">
          <form onSubmit={handleLocationInputSubmit} className="flex-1">
            <Input
              type="text"
              placeholder="Enter starting location or use current location"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background"
            />
          </form>
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            className="px-3 py-2 rounded-lg border hover:bg-accent font-medium whitespace-nowrap"
          >
            Use My Location
          </button>
        </div>

        <div className="flex flex-wrap gap-2 w-full">
          <a href={deepLink} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg border hover:bg-accent font-medium">
            Open in Google Maps
          </a>
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
            </div>
          );
        }