import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

interface ResultCardProps {
  room: string;
  building: string;
  fullName: string;
  distance?: string;
}

export function ResultCard({
  room,
  building,
  fullName,
  distance,
}: ResultCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary/50 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <MapPin className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm text-foreground">
          {room} · {building}
        </h3>
        <p className="text-xs text-muted-foreground truncate">
          {fullName}
        </p>
        {distance && (
          <p className="text-xs text-muted-foreground mt-1">
            {distance}
          </p>
        )}
      </div>
      <Button
        size="sm"
        className="rounded-lg flex-shrink-0 gap-1.5"
      >
        View on Map
        <ArrowRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}