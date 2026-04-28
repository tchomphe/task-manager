import type { TaskStatus } from '../types';

interface Props {
  status: TaskStatus;
}

export function StatusBadge({ status }: Props) {
  const styles: Record<TaskStatus, string> = {
    Todo: 'bg-slate-100 text-slate-600',
    InProgress: 'bg-blue-100 text-blue-600',
    Done: 'bg-green-100 text-green-600',
  };
  const labels: Record<TaskStatus, string> = {
    Todo: 'Todo',
    InProgress: 'In Progress',
    Done: 'Done',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
