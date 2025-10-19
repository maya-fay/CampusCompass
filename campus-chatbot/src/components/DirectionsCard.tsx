// src/components/DirectionsCard.tsx
import { useState } from "react";
import type { LatLng } from "../lib/maps";
import { staticMapUrl, gmapsDeepLink, gmapsDeepLinkByName, gmapsEmbedUrlForDest } from "../lib/maps";

type Props = {
  origin: { name: string; coords?: LatLng } | null;  // coords optional if geolocation denied
  dest:   { name: string; coords: LatLng };
  mode?: "walking" | "driving" | "transit";
  notes?: string[];
  onLocationUpdate?: (location: { name: string; coords: LatLng }) => void;
};

console.log("Maps key:", import.meta.env.VITE_GOOGLE_MAPS_KEY);

export default function DirectionsCard({ origin, dest, mode = "walking", notes = [], onLocationUpdate }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);

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
        <button
          className="px-3 py-2 rounded-lg border hover:bg-accent"
          onClick={() => {
            if ("geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  if (origin && origin.coords) {
                    // Do nothing if we already have coords
                    return;
                  }
                  // You'll need to add onLocationUpdate prop and handler
                  onLocationUpdate?.({
                    name: "My Location",
                    coords: {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                    }
                  });
                },
                (error) => {
                  console.error("Geolocation error:", error);
                  // Could add error handling UI here
                }
              );
            }
          }}
        >
          Use my location
        </button>
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