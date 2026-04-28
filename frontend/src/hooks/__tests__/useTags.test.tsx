import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type ReactNode } from 'react';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '../useTags';
import axiosClient from '../../lib/axiosClient';

vi.mock('../../lib/axiosClient');

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

const mockTags = [
  { id: 'tag-1', name: 'work', color: '#6366f1' },
  { id: 'tag-2', name: 'urgent', color: null },
];

describe('useTags', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('fetches tags from /tags', async () => {
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockTags });
    const { result } = renderHook(() => useTags(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].name).toBe('work');
  });
});

describe('useCreateTag', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('posts to /tags', async () => {
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: { id: 'tag-3', name: 'design', color: null } });
    const { result } = renderHook(() => useCreateTag(), { wrapper });
    await result.current.mutateAsync({ name: 'design' });
    expect(vi.mocked(axiosClient.post)).toHaveBeenCalledWith('/tags', { name: 'design' });
  });
});

describe('useDeleteTag', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('calls DELETE /tags/:id', async () => {
    vi.mocked(axiosClient.delete).mockResolvedValueOnce({ data: undefined });
    const { result } = renderHook(() => useDeleteTag(), { wrapper });
    await result.current.mutateAsync('tag-1');
    expect(vi.mocked(axiosClient.delete)).toHaveBeenCalledWith('/tags/tag-1');
  });
});

describe('useUpdateTag', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('puts to /tags/:id', async () => {
    vi.mocked(axiosClient.put).mockResolvedValueOnce({ data: { id: 'tag-1', name: 'renamed', color: '#ff0000' } });
    const { result } = renderHook(() => useUpdateTag(), { wrapper });
    await result.current.mutateAsync({ id: 'tag-1', data: { name: 'renamed', color: '#ff0000' } });
    expect(vi.mocked(axiosClient.put)).toHaveBeenCalledWith('/tags/tag-1', { name: 'renamed', color: '#ff0000' });
  });
});
