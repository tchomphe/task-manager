interface Props {
  name: string;
  color: string | null;
  onRemove?: () => void;
}

export function TagChip({ name, color, onRemove }: Props) {
  const style = color ? { backgroundColor: `${color}22`, color } : undefined;
  const base = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium';
  const fallback = 'bg-gray-100 text-gray-600';

  return (
    <span className={color ? base : `${base} ${fallback}`} style={style}>
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 leading-none"
          aria-label={`Remove ${name}`}
        >
          ✕
        </button>
      )}
    </span>
  );
}
