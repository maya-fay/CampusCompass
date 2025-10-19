import { useMemo, useState } from "react";
import { Navigation, Clock, MapPin } from "lucide-react";
import type { Step } from "../lib/getDirections";

export default function DirectionsResult({
  destName,
  distanceText,
  durationText,
  steps,
}: {
  destName: string;
  distanceText: string;
  durationText: string;
  steps: { text: string; distance: string; duration: string }[];
}) {
  const summary = `Walking to ${destName}: ${distanceText}, about ${durationText}.`;

  const speechText = useMemo(() => {
    const short = steps.slice(0, 6).map((s, i) => `${i + 1}. ${s.text}.`).join(" ");
    return `${summary} Then: ${short}`;
  }, [summary, steps]);

  const [speaking, setSpeaking] = useState(false);

  function speak() {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(speechText);
      u.onend = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    } catch {}
  }
  function stop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Directions to {destName}</h3>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{distanceText}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{durationText}</span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Walking Directions:</h4>
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                {index + 1}
              </span>
              <div className="flex-1 space-y-1">
                <p className="text-sm leading-relaxed">{step.text}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{step.distance}</span>
                  <span>•</span>
                  <span>{step.duration}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex gap-2">
        {!speaking ? (
          <button
            onClick={speak}
            className="px-3 py-2 rounded-lg border hover:bg-gray-50"
          >
            🔊 Read directions
          </button>
        ) : (
          <button
            onClick={stop}
            className="px-3 py-2 rounded-lg border hover:bg-gray-50"
          >
            ⏹ Stop
          </button>
        )}
      </div>
    </div>
  );
}
