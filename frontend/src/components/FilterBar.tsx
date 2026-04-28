import { useSearchParams } from 'react-router-dom';

export function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');

  const handleStatus = (v: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (v) next.set('status', v); else next.delete('status');
      next.delete('page');
      return next;
    }, { replace: true });
  };

  const handlePriority = (v: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (v) next.set('priority', v); else next.delete('priority');
      next.delete('page');
      return next;
    }, { replace: true });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Status</label>
        <select
          value={status ?? ''}
          onChange={e => handleStatus(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All</option>
          <option value="Todo">Todo</option>
          <option value="InProgress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Priority</label>
        <select
          value={priority ?? ''}
          onChange={e => handlePriority(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
    </div>
  );
}
