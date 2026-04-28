import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../lib/axiosClient';
import type { TagResponse, CreateTagRequest, UpdateTagRequest } from '../types';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => axiosClient.get<TagResponse[]>('/tags').then(r => r.data),
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTagRequest) =>
      axiosClient.post<TagResponse>('/tags', data).then(r => r.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tags'] }); },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagRequest }) =>
      axiosClient.put<TagResponse>(`/tags/${id}`, data).then(r => r.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tags'] }); },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => axiosClient.delete(`/tags/${id}`),
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ['tags'] }); },
  });
}
