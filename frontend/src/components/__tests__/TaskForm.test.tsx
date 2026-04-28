import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type ReactNode } from 'react';
import { TaskForm } from '../TaskForm';
import axiosClient from '../../lib/axiosClient';

vi.mock('../../lib/axiosClient');

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/tasks']}>
        <Routes><Route path="/tasks" element={<>{children}</>} /></Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('TaskForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(axiosClient.get).mockResolvedValue({ data: [] });
  });

  it('shows validation error when title is empty on submit', async () => {
    render(<TaskForm onSubmit={vi.fn()} />, { wrapper });
    await userEvent.click(screen.getByRole('button', { name: /create task/i }));
    await waitFor(() => expect(screen.getByText(/title is required/i)).toBeDefined());
  });

  it('calls onSubmit with correct shape on valid submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={onSubmit} />, { wrapper });
    await userEvent.type(screen.getByLabelText(/title/i), 'My new task');
    await userEvent.click(screen.getByRole('button', { name: /create task/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: 'My new task', tags: [] })));
  });

  it('shows "Save changes" button in edit mode', () => {
    const task = { id: '1', title: 'Existing', description: null, status: 'Todo' as const, priority: 'Medium' as const, dueDate: null, tags: [], createdAt: '', updatedAt: '' };
    render(<TaskForm task={task} onSubmit={vi.fn()} onDelete={vi.fn()} />, { wrapper });
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDefined();
    expect(screen.getByText(/delete task/i)).toBeDefined();
  });

  it('shows tag autocomplete dropdown when typing', async () => {
    vi.mocked(axiosClient.get).mockResolvedValue({ data: [{ id: 't1', name: 'work', color: '#6366f1' }] });
    render(<TaskForm onSubmit={vi.fn()} />, { wrapper });
    await userEvent.type(screen.getByPlaceholderText(/add tags/i), 'wo');
    await waitFor(() => expect(screen.getByText('work')).toBeDefined());
  });

  it('shows Create option when tag does not exist', async () => {
    vi.mocked(axiosClient.get).mockResolvedValue({ data: [] });
    render(<TaskForm onSubmit={vi.fn()} />, { wrapper });
    await userEvent.type(screen.getByPlaceholderText(/add tags/i), 'newone');
    await waitFor(() => expect(screen.getByText(/create "newone"/i)).toBeDefined());
  });
});
