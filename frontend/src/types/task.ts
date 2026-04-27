import type { TagResponse } from './tag';

export type TaskStatus = 'Todo' | 'InProgress' | 'Done';
export type Priority = 'Low' | 'Medium' | 'High';

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  tags: TagResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  tags?: string[];
}

export interface TaskQueryParams {
  search?: string;
  status?: TaskStatus;
  priority?: Priority;
  page?: number;
  pageSize?: number;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
