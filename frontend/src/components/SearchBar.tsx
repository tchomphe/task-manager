import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function SearchBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get('search') ?? '');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        const trimmed = value.trim();
        if (trimmed) next.set('search', trimmed);
        else next.delete('search');
        next.delete('page');
        return next;
      }, { replace: true });
    }, 300);
    return () => clearTimeout(timeout);
  }, [value, setSearchParams]);

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
