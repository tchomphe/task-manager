import { ReactNode } from 'react';
import { Button } from './Button';

interface Props {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
  icon?: ReactNode;
}

export function EmptyState({ title, subtitle, ctaLabel, onCta, icon = '📋' }: Props) {
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      {ctaLabel && onCta && (
        <Button variant="primary" className="mt-4" onClick={onCta}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
