import { useSearchParams } from 'react-router-dom';
import type { TaskQueryParams, TaskStatus, Priority } from '../types';

const VALID_STATUSES: ReadonlySet<string> = new Set(['Todo', 'InProgress', 'Done']);
const VALID_PRIORITIES: ReadonlySet<string> = new Set(['Low', 'Medium', 'High']);

export function useQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  function getParam(key: string): string | null {
    return searchParams.get(key);
  }

  function setParam(key: string, value: string | null): void {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        if (value === null) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );
  }

  function getTaskParams(): TaskQueryParams {
    const page = searchParams.get('page');
    const rawStatus = searchParams.get('status');
    const rawPriority = searchParams.get('priority');
    const parsed = page !== null ? parseInt(page, 10) : 1;
    return {
      search: searchParams.get('search') ?? undefined,
      status: (rawStatus && VALID_STATUSES.has(rawStatus)) ? rawStatus as TaskStatus : undefined,
      priority: (rawPriority && VALID_PRIORITIES.has(rawPriority)) ? rawPriority as Priority : undefined,
      page: (Number.isFinite(parsed) && parsed >= 1) ? parsed : 1,
    };
  }

  return { getParam, setParam, getTaskParams };
}
