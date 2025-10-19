import {
  Calendar,
  MapPin,
  Clock,
  CalendarPlus,
} from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface EventCardProps {
  id: string;
  title: string;
  organization: string;
  date: string;
  time: string;
  location: string;
  building: string;
  imageUrl: string;
  onAddToCalendar: () => void;
}

export function EventCard({
  title,
  organization,
  date,
  time,
  location,
  building,
  imageUrl,
  onAddToCalendar,
}: EventCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
      {/* Event Image */}
      <div className="relative h-40 bg-secondary overflow-hidden">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Organization Badge */}
        <div className="absolute top-3 left-3">
          <div className="px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm border border-border">
            <span className="text-xs text-foreground">
              {organization}
            </span>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-4">
        <h3 className="text-base text-foreground mb-3">
          {title}
        </h3>

        {/* Date & Time */}
        <div className="flex items-start gap-2 mb-2">
          <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{date}</p>
            <p className="text-xs text-muted-foreground">
              {time}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 mb-4">
          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              {location}
            </p>
            <p className="text-xs text-muted-foreground">
              {building}
            </p>
          </div>
        </div>

        {/* Add to Calendar Button */}
        <Button
          onClick={onAddToCalendar}
          variant="outline"
          className="w-full rounded-lg gap-2"
          size="sm"
        >
          <CalendarPlus className="w-4 h-4" />
          Add to Calendar
        </Button>
      </div>
    </div>
  );
}