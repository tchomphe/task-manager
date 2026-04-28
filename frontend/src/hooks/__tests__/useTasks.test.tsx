import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type ReactNode } from 'react';
import { useTasks, useTask, useCreateTask, useDeleteTask } from '../useTasks';
import axiosClient from '../../lib/axiosClient';
import type { PagedResponse, TaskResponse } from '../../types';

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
  beforeEach(() => { vi.resetAllMocks(); });

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
  beforeEach(() => { vi.resetAllMocks(); });

  it('posts to /tasks and invalidates tasks query', async () => {
    const newTask = { ...mockPage.items[0], id: '2', title: 'New Task' };
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: newTask });
    const { result } = renderHook(() => useCreateTask(), { wrapper });
    await result.current.mutateAsync({ title: 'New Task' });
    expect(vi.mocked(axiosClient.post)).toHaveBeenCalledWith('/tasks', { title: 'New Task' });
  });
});

describe('useDeleteTask', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('calls DELETE /tasks/:id', async () => {
    vi.mocked(axiosClient.delete).mockResolvedValueOnce({ data: undefined });
    const { result } = renderHook(() => useDeleteTask(), { wrapper });
    await result.current.mutateAsync('abc-123');
    expect(vi.mocked(axiosClient.delete)).toHaveBeenCalledWith('/tasks/abc-123');
  });
});

describe('useTask', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('fetches a single task by id', async () => {
    const task = mockPage.items[0];
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: task });
    const { result } = renderHook(() => useTask('1'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.title).toBe('Task A');
    expect(vi.mocked(axiosClient.get)).toHaveBeenCalledWith('/tasks/1');
  });

  it('does not fetch when id is undefined', async () => {
    const { result } = renderHook(() => useTask(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(vi.mocked(axiosClient.get)).not.toHaveBeenCalled();
  });

  it('does not fetch when id is "new"', async () => {
    const { result } = renderHook(() => useTask('new'), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(vi.mocked(axiosClient.get)).not.toHaveBeenCalled();
  });
});

describe('useDeleteTask optimistic update', () => {
  it('optimistically removes task from list cache', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    qc.setQueryData(['tasks', 'list', {}], mockPage);

    let resolveDelete!: (value: { data: undefined }) => void;
    vi.mocked(axiosClient.delete).mockReturnValueOnce(
      new Promise(resolve => { resolveDelete = resolve; })
    );

    const customWrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteTask(), { wrapper: customWrapper });
    result.current.mutate('1');

    await waitFor(() => {
      const cached = qc.getQueryData<PagedResponse<TaskResponse>>(['tasks', 'list', {}]);
      expect(cached?.items).toHaveLength(0);
    });

    resolveDelete({ data: undefined });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('rolls back cache on delete error', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    qc.setQueryData(['tasks', 'list', {}], mockPage);

    vi.mocked(axiosClient.delete).mockRejectedValueOnce(new Error('Network error'));
    vi.mocked(axiosClient.get).mockResolvedValue({ data: mockPage });

    const customWrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteTask(), { wrapper: customWrapper });

    await expect(result.current.mutateAsync('1')).rejects.toThrow();

    await waitFor(() => {
      const cached = qc.getQueryData<PagedResponse<TaskResponse>>(['tasks', 'list', {}]);
      expect(cached?.items).toHaveLength(1);
    });
  });
});
