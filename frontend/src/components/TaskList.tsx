import type { TaskResponse } from '../types';
import { TaskCard } from './TaskCard';

interface Props { tasks: TaskResponse[] }

export function TaskList({ tasks }: Props) {
  return (
    <div className="space-y-2">
      {tasks.map(task => <TaskCard key={task.id} task={task} />)}
    </div>
  );
}
