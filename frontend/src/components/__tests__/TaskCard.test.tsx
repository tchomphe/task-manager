import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type ReactNode } from 'react';
import { TaskCard } from '../TaskCard';
import axiosClient from '../../lib/axiosClient';
import type { TaskResponse } from '../../types';

vi.mock('../../lib/axiosClient');

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/tasks']}>
        <Routes>
          <Route path="/tasks" element={<>{children}</>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const mockTask: TaskResponse = {
  id: 'task-1',
  title: 'Fix the bug',
  description: null,
  status: 'Todo',
  priority: 'High',
  dueDate: null,
  tags: [{ id: 'tag-1', name: 'work', color: '#6366f1' }],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('TaskCard', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('renders task title, priority, and status', () => {
    render(<TaskCard task={mockTask} />, { wrapper });
    expect(screen.getByText('Fix the bug')).toBeDefined();
    expect(screen.getByText('High')).toBeDefined();
    expect(screen.getByText('Todo')).toBeDefined();
  });

  it('renders tag chips', () => {
    render(<TaskCard task={mockTask} />, { wrapper });
    expect(screen.getByText('work')).toBeDefined();
  });

  it('calls useUpdateTask with Done when checkmark clicked on Todo task', async () => {
    vi.mocked(axiosClient.put).mockResolvedValueOnce({ data: { ...mockTask, status: 'Done' } });
    render(<TaskCard task={mockTask} />, { wrapper });
    await userEvent.click(screen.getByRole('button', { name: /mark as done/i }));
    expect(vi.mocked(axiosClient.put)).toHaveBeenCalledWith('/tasks/task-1', { status: 'Done' });
  });

  it('calls useUpdateTask with Todo when checkmark clicked on Done task', async () => {
    vi.mocked(axiosClient.put).mockResolvedValueOnce({ data: { ...mockTask, status: 'Todo' } });
    const doneTask = { ...mockTask, status: 'Done' as const };
    render(<TaskCard task={doneTask} />, { wrapper });
    await userEvent.click(screen.getByRole('button', { name: /mark as todo/i }));
    expect(vi.mocked(axiosClient.put)).toHaveBeenCalledWith('/tasks/task-1', { status: 'Todo' });
  });
});
