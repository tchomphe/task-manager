import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../AuthContext';
import { useQueryParams } from '../lib/queryParams';
import { useTasks } from '../hooks/useTasks';
import { Button } from '../components/Button';
import { SearchBar } from '../components/SearchBar';
import { FilterBar } from '../components/FilterBar';
import { TaskList } from '../components/TaskList';
import { SkeletonCard } from '../components/SkeletonCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { Pagination } from '../components/Pagination';
import { TaskModal } from '../components/TaskModal';
import { TagManagerModal } from '../components/TagManagerModal';

export function TasksPage() {
  const { clearToken } = useAuthContext();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { getTaskParams } = useQueryParams();
  const params = getTaskParams();
  const { data, isLoading, isError, refetch } = useTasks(params);
  const [manageTags, setManageTags] = useState(false);

  const handleLogout = () => { clearToken(); navigate('/login'); };

  const openCreate = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('task', 'new');
      return next;
    }, { replace: true });
  };

  const hasFilters = !!(params.search || params.status || params.priority);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="text-lg font-semibold text-gray-900">Task Manager</span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setManageTags(true)}>🏷 Tags</Button>
          <Button variant="secondary" onClick={handleLogout}>Log out</Button>
        </div>
      </nav>

      <div className="flex" style={{ height: 'calc(100vh - 57px)' }}>
        <aside className="w-48 flex-shrink-0 border-r border-gray-200 bg-white p-4 overflow-y-auto">
          <FilterBar />
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <SearchBar />
            </div>
            <Button onClick={openCreate}>+ New Task</Button>
          </div>

          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {isError && <ErrorMessage onRetry={() => refetch()} />}

          {!isLoading && !isError && data?.items.length === 0 && (
            <EmptyState
              title={hasFilters ? 'No tasks match your filters' : 'No tasks yet'}
              subtitle={hasFilters ? 'Try adjusting your search or filters.' : 'Create your first task to get started.'}
              ctaLabel={hasFilters ? undefined : '+ New Task'}
              onCta={hasFilters ? undefined : openCreate}
            />
          )}

          {!isLoading && !isError && data && data.items.length > 0 && (
            <>
              <TaskList tasks={data.items} />
              <Pagination page={data.page} totalPages={data.totalPages} />
            </>
          )}
        </main>
      </div>

      <TaskModal />
      {manageTags && <TagManagerModal onClose={() => setManageTags(false)} />}
    </div>
  );
}
