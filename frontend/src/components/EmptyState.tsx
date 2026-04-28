interface Props {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ title, subtitle, ctaLabel, onCta }: Props) {
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-4">📋</div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
