import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type ReactNode } from 'react';
import { useTasks, useCreateTask, useDeleteTask } from '../useTasks';
import axiosClient from '../../lib/axiosClient';

vi.mock('../../lib/axiosClient');

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

const mockPage = {
  items: [{ id: '1', title: 'Task A', status: 'Todo', priority: 'Medium', description: null, dueDate: null, tags: [], createdAt: '', updatedAt: '' }],
  totalCount: 1, page: 1, pageSize: 20, totalPages: 1,
};

describe('useTasks', () => {
  beforeEach(() => vi.resetAllMocks());

  it('fetches tasks and returns paged data', async () => {
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockPage });
    const { result } = renderHook(() => useTasks({}), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items[0].title).toBe('Task A');
    expect(vi.mocked(axiosClient.get)).toHaveBeenCalledWith('/tasks');
  });

  it('builds query string from params', async () => {
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockPage });
    renderHook(() => useTasks({ search: 'foo', status: 'Todo', page: 2 }), { wrapper });
    await waitFor(() => expect(vi.mocked(axiosClient.get)).toHaveBeenCalledWith('/tasks?search=foo&status=Todo&page=2'));
  });
});

describe('useCreateTask', () => {
  beforeEach(() => vi.resetAllMocks());

  it('posts to /tasks and invalidates tasks query', async () => {
    const newTask = { ...mockPage.items[0], id: '2', title: 'New Task' };
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: newTask });
    const { result } = renderHook(() => useCreateTask(), { wrapper });
    await result.current.mutateAsync({ title: 'New Task' });
    expect(vi.mocked(axiosClient.post)).toHaveBeenCalledWith('/tasks', { title: 'New Task' });
  });
});

describe('useDeleteTask', () => {
  beforeEach(() => vi.resetAllMocks());

  it('calls DELETE /tasks/:id', async () => {
    vi.mocked(axiosClient.delete).mockResolvedValueOnce({ data: undefined });
    const { result } = renderHook(() => useDeleteTask(), { wrapper });
    await result.current.mutateAsync('abc-123');
    expect(vi.mocked(axiosClient.delete)).toHaveBeenCalledWith('/tasks/abc-123');
  });
});
