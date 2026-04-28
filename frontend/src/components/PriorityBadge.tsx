import type { Priority } from '../types';

interface Props {
  priority: Priority;
}

export function PriorityBadge({ priority }: Props) {
  const styles: Record<Priority, string> = {
    Low: 'bg-gray-100 text-gray-600',
    Medium: 'bg-yellow-100 text-yellow-700',
    High: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[priority]}`}>
      {priority}
    </span>
  );
}
