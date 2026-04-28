import { useSearchParams } from 'react-router-dom';
import type { TaskResponse } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { TagChip } from './TagChip';
import { useUpdateTask } from '../hooks/useTasks';

interface Props { task: TaskResponse }

export function TaskCard({ task }: Props) {
  const [, setSearchParams] = useSearchParams();
  const updateTask = useUpdateTask();
  const isDone = task.status === 'Done';

  const handleCheckmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask.mutate({ id: task.id, data: { status: isDone ? 'Todo' : 'Done' } });
  };

  const handleClick = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('task', task.id);
      return next;
    }, { replace: true });
  };

  return (
    <div
      onClick={handleClick}
      className="border border-gray-200 rounded-lg p-4 bg-white hover:border-indigo-300 cursor-pointer transition-colors"
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={handleCheckmark}
          disabled={updateTask.isPending}
          aria-label={isDone ? 'Mark as todo' : 'Mark as done'}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors disabled:opacity-50 ${isDone ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'}`}
        >
          {isDone && (
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {task.title}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
            {task.dueDate && (
              <span className="text-xs text-gray-500">
                Due {new Date(task.dueDate).toLocaleDateString('en-US', { timeZone: 'UTC' })}
              </span>
            )}
            {task.tags.map(tag => <TagChip key={tag.id} name={tag.name} color={tag.color} />)}
          </div>
          {updateTask.isError && (
            <p className="text-xs text-red-600 mt-1">Failed to update status. Please try again.</p>
          )}
        </div>
      </div>
    </div>
  );
}
