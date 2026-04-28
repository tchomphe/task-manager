import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskModal } from '../TaskModal';
import axiosClient from '../../lib/axiosClient';
import { ToastProvider } from '../Toast';

vi.mock('../../lib/axiosClient');

function renderModal(initialEntry = '/tasks') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes><Route path="/tasks" element={<TaskModal />} /></Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe('TaskModal', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(axiosClient.get).mockResolvedValue({ data: [] });
  });

  it('renders nothing when ?task is absent', () => {
    renderModal('/tasks');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByText('New Task')).toBeNull();
  });

  it('renders create form when ?task=new', () => {
    renderModal('/tasks?task=new');
    expect(screen.getByText('New Task')).toBeDefined();
    expect(screen.getByRole('button', { name: /create task/i })).toBeDefined();
  });

  it('renders edit form when ?task=<id> and task is fetched', async () => {
    vi.mocked(axiosClient.get).mockImplementation(url => {
      if (String(url).includes('/tasks/task-1')) {
        return Promise.resolve({ data: { id: 'task-1', title: 'Existing Task', description: null, status: 'Todo', priority: 'Medium', dueDate: null, tags: [], createdAt: '', updatedAt: '' } });
      }
      return Promise.resolve({ data: [] });
    });
    renderModal('/tasks?task=task-1');
    await waitFor(() => expect(screen.getByText('Edit Task')).toBeDefined());
  });

  it('closes modal on X button click', async () => {
    renderModal('/tasks?task=new');
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    await waitFor(() => expect(screen.queryByText('New Task')).toBeNull());
  });

  it('closes modal on Escape key', async () => {
    renderModal('/tasks?task=new');
    expect(screen.getByText('New Task')).toBeDefined();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByText('New Task')).toBeNull());
  });

  it('closes modal on backdrop click', async () => {
    renderModal('/tasks?task=new');
    expect(screen.getByText('New Task')).toBeDefined();
    await userEvent.click(screen.getByTestId('modal-backdrop'));
    await waitFor(() => expect(screen.queryByText('New Task')).toBeNull());
  });

  it('shows ConfirmDialog when Delete task is clicked in edit mode', async () => {
    vi.mocked(axiosClient.get).mockImplementation(url => {
      if (String(url).includes('/tasks/task-1')) {
        return Promise.resolve({ data: { id: 'task-1', title: 'Existing Task', description: null, status: 'Todo', priority: 'Medium', dueDate: null, tags: [], createdAt: '', updatedAt: '' } });
      }
      return Promise.resolve({ data: [] });
    });
    vi.mocked(axiosClient.delete).mockResolvedValueOnce({ data: undefined });

    renderModal('/tasks?task=task-1');
    await waitFor(() => expect(screen.getByText(/delete task/i)).toBeDefined());

    await userEvent.click(screen.getByText(/delete task/i));
    expect(screen.getByText(/cannot be undone/i)).toBeDefined();
  });
});
