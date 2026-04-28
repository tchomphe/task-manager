import { useQueryParams } from '../lib/queryParams';

export function FilterBar() {
  const { getParam, setParam } = useQueryParams();
  const status = getParam('status');
  const priority = getParam('priority');

  const handleStatus = (v: string) => { setParam('status', v || null); setParam('page', null); };
  const handlePriority = (v: string) => { setParam('priority', v || null); setParam('page', null); };

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
