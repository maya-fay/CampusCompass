import { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  onClick,
}: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2 p-4 rounded-xl bg-card border border-border hover:bg-accent hover:border-accent-foreground/20 transition-all active:scale-[0.98]"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="text-left">
        <h4 className="text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {description}
        </p>
      </div>
    </button>
  );
}