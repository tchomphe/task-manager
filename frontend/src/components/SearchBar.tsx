import { useEffect, useState } from 'react';
import { useQueryParams } from '../lib/queryParams';

export function SearchBar() {
  const { getParam, setParam } = useQueryParams();
  const [value, setValue] = useState(getParam('search') ?? '');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setParam('search', value.trim() || null);
      setParam('page', null);
    }, 300);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      type="text"
      value={value}
      onChange={e => setValue(e.target.value)}
      placeholder="Search tasks..."
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  );
}
