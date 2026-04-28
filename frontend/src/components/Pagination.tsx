import { useQueryParams } from '../lib/queryParams';

interface Props { page: number; totalPages: number }

export function Pagination({ page, totalPages }: Props) {
  const { setParam } = useQueryParams();
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <button
        onClick={() => setParam('page', String(page - 1))}
        disabled={page <= 1}
        className="px-3 py-1 text-sm rounded-md border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
      >
        ← Prev
      </button>
      <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
      <button
        onClick={() => setParam('page', String(page + 1))}
        disabled={page >= totalPages}
        className="px-3 py-1 text-sm rounded-md border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
      >
        Next →
      </button>
    </div>
  );
}
