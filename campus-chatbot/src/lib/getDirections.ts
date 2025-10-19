import { htmlToText } from "./text";

export type Step = { text: string; distance: string; duration: string };

export type DirectionsData = {
  distanceText: string;
  durationText: string;
  startAddress: string;
  endAddress: string;
  polyline: string;
  steps: Step[];
};

export async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: "walking" | "driving" | "transit" = "walking"
): Promise<DirectionsData> {
  const res = await fetch("/api/directions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ origin, destination, mode }),
  });
  if (!res.ok) throw new Error(`Directions failed: ${await res.text()}`);
  const j = await res.json();
  return {
    distanceText: j.distanceText,
    durationText: j.durationText,
    startAddress: j.startAddress,
    endAddress: j.endAddress,
    polyline: j.polyline,
    steps: (j.steps || []).map((s: any) => ({
      text: htmlToText(s.html),
      distance: s.distance,
      duration: s.duration,
    })),
  };
}
