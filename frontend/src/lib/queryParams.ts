import { useSearchParams } from 'react-router-dom';
import type { TaskQueryParams, TaskStatus, Priority } from '../types';

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
    const status = searchParams.get('status') as TaskStatus | null;
    const priority = searchParams.get('priority') as Priority | null;
    return {
      search: searchParams.get('search') ?? undefined,
      status: status ?? undefined,
      priority: priority ?? undefined,
      page: page ? parseInt(page, 10) : 1,
    };
  }

  return { getParam, setParam, getTaskParams };
}
