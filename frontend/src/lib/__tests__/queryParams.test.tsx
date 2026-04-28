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
});
