import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../lib/axiosClient';
import { useToast } from '../components/Toast';
import type { TagResponse, CreateTagRequest, UpdateTagRequest } from '../types';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => axiosClient.get<TagResponse[]>('/tags').then(r => r.data),
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (data: CreateTagRequest) =>
      axiosClient.post<TagResponse>('/tags', data).then(r => r.data),
    onSuccess: () => { showToast('Tag created'); },
    onError: () => { showToast('Failed to create tag', 'error'); },
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ['tags'] }); },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagRequest }) =>
      axiosClient.put<TagResponse>(`/tags/${id}`, data).then(r => r.data),
    onSuccess: () => { showToast('Tag updated'); },
    onError: () => { showToast('Failed to update tag', 'error'); },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (id: string) => axiosClient.delete(`/tags/${id}`),
    onSuccess: () => { showToast('Tag deleted'); },
    onError: () => { showToast('Failed to delete tag', 'error'); },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
