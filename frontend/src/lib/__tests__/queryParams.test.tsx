import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { useQueryParams } from '../queryParams';

function TestComponent() {
  const { getParam, setParam, getTaskParams } = useQueryParams();
  const params = getTaskParams();
  return (
    <div>
      <span data-testid="search">{getParam('search') ?? 'none'}</span>
      <span data-testid="page">{params.page}</span>
      <span data-testid="status">{params.status ?? 'none'}</span>
      <span data-testid="priority">{params.priority ?? 'none'}</span>
      <button onClick={() => setParam('search', 'hello')}>set search</button>
      <button onClick={() => setParam('search', null)}>clear search</button>
    </div>
  );
}

function render_in_router(initialEntry = '/tasks') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/tasks" element={<TestComponent />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('useQueryParams', () => {
  it('reads existing search param', () => {
    render_in_router('/tasks?search=foo');
    expect(screen.getByTestId('search').textContent).toBe('foo');
  });

  it('defaults page to 1 when not set', () => {
    render_in_router('/tasks');
    expect(screen.getByTestId('page').textContent).toBe('1');
  });

  it('sets a param', async () => {
    render_in_router('/tasks');
    await userEvent.click(screen.getByRole('button', { name: 'set search' }));
    expect(screen.getByTestId('search').textContent).toBe('hello');
  });

  it('clears a param', async () => {
    render_in_router('/tasks?search=foo');
    await userEvent.click(screen.getByRole('button', { name: 'clear search' }));
    expect(screen.getByTestId('search').textContent).toBe('none');
  });

  it('reads page from URL', () => {
    render_in_router('/tasks?page=3');
    expect(screen.getByTestId('page').textContent).toBe('3');
  });

  it('defaults page to 1 for invalid page values', () => {
    render_in_router('/tasks?page=0');
    expect(screen.getByTestId('page').textContent).toBe('1');
  });

  it('reads valid status from URL', () => {
    render_in_router('/tasks?status=InProgress');
    expect(screen.getByTestId('status').textContent).toBe('InProgress');
  });

  it('ignores invalid status values', () => {
    render_in_router('/tasks?status=invalid');
    expect(screen.getByTestId('status').textContent).toBe('none');
  });

  it('reads valid priority from URL', () => {
    render_in_router('/tasks?priority=High');
    expect(screen.getByTestId('priority').textContent).toBe('High');
  });
});
