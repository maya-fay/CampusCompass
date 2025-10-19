import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ImageCardProps {
  src: string;
  alt: string;
  caption?: string;
}

export function ImageCard({
  src,
  alt,
  caption,
}: ImageCardProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card max-w-md">
      <ImageWithFallback
        src={src}
        alt={alt}
        className="w-full h-auto object-cover"
      />
      {caption && (
        <div className="p-3 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
}