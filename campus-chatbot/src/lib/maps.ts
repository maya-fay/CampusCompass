// src/lib/maps.ts
export type LatLng = { lat: number; lng: number };

// ✅ Works with NO extra libraries. Uses Google Static Maps (optional) + deep links.

// ---- Static map preview (optional) ----
// If you don't have a key yet, set VITE_GOOGLE_MAPS_KEY="" and we’ll skip preview.
export function staticMapUrl(origin: LatLng, dest: LatLng, w = 640, h = 320): string | null {
  const k = import.meta.env?.VITE_GOOGLE_MAPS_KEY;
  console.log("[maps.ts] Google Maps API Key:", k);
  if (!k) {
    console.warn("[maps.ts] No Google Maps API key found. Static map preview will be skipped.");
    return null; // no key? caller can fall back to an <iframe> or no image
  }
  const size = `${w}x${h}`;
  const markers =
    `&markers=color:green|label:A|${origin.lat},${origin.lng}` +
    `&markers=color:red|label:B|${dest.lat},${dest.lng}`;
  const path = `&path=weight:4|${origin.lat},${origin.lng}|${dest.lat},${dest.lng}`;
  return `https://maps.googleapis.com/maps/api/staticmap?size=${size}${markers}${path}&maptype=roadmap&scale=2&key=${k}`;
}

// ---- Deep links (always work; no key required) ----
export function gmapsDeepLink(origin: LatLng, dest: LatLng, mode: "walking"|"driving"|"transit"="walking") {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${dest.lat},${dest.lng}&travelmode=${mode}`;
}

export function gmapsDeepLinkByName(originName: string, destName: string, mode: "walking"|"driving"|"transit"="walking") {
  const q = new URLSearchParams({
    api: "1",
    origin: originName,
    destination: destName,
    travelmode: mode,
  });
  return `https://www.google.com/maps/dir/?${q.toString()}`;
}

// ---- Zero-key embeddable fallback (no API key) ----
// Shows destination only; Google will still start from “Your location” when user taps directions.
export function gmapsEmbedUrlForDest(dest: LatLng | string) {
  const base = "https://www.google.com/maps";
  if (typeof dest === "string") return `${base}?q=${encodeURIComponent(dest)}&output=embed`;
  return `${base}?q=${dest.lat},${dest.lng}&output=embed`;
}
