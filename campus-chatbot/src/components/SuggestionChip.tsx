interface SuggestionChipProps {
  label: string;
  onClick: () => void;
}

export function SuggestionChip({
  label,
  onClick,
}: SuggestionChipProps) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full bg-card border border-border text-sm text-foreground hover:bg-secondary hover:border-primary/30 transition-all active:scale-[0.98] whitespace-nowrap"
    >
      {label}
    </button>
  );
}