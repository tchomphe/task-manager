import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../lib/axiosClient';
import type { TaskResponse, CreateTaskRequest, UpdateTaskRequest, PagedResponse, TaskQueryParams } from '../types';

export function useTasks(params: TaskQueryParams) {
  return useQuery({
    queryKey: ['tasks', 'list', params],
    queryFn: () => {
      const sp = new URLSearchParams();
      if (params.search) sp.set('search', params.search);
      if (params.status) sp.set('status', params.status);
      if (params.priority) sp.set('priority', params.priority);
      if (params.page && params.page > 1) sp.set('page', String(params.page));
      if (params.pageSize) sp.set('pageSize', String(params.pageSize));
      const qs = sp.toString();
      return axiosClient.get<PagedResponse<TaskResponse>>(`/tasks${qs ? `?${qs}` : ''}`).then(r => r.data);
    },
  });
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: ['tasks', 'detail', id],
    queryFn: () => axiosClient.get<TaskResponse>(`/tasks/${id}`).then(r => r.data),
    enabled: !!id && id !== 'new',
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskRequest) =>
      axiosClient.post<TaskResponse>('/tasks', data).then(r => r.data),
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      axiosClient.put<TaskResponse>(`/tasks/${id}`, data).then(r => r.data),
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => axiosClient.delete(`/tasks/${id}`),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', 'list'] });
      const previous = queryClient.getQueriesData<PagedResponse<TaskResponse>>({ queryKey: ['tasks', 'list'] });
      queryClient.setQueriesData<PagedResponse<TaskResponse>>(
        { queryKey: ['tasks', 'list'] },
        old => old ? { ...old, items: old.items.filter(t => t.id !== id) } : old,
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); },
  });
}
